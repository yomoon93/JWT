require('dotenv').config()


const express = require("express");
const app = express();
const jwt = require('jsonwebtoken')

app.use(express.json())



const posts = [
  {
    username: "Kyle",
    title: "Post 1"
  },
  {
    username: "Jim",
    title: "Post 2"
  }
]
app.get("/posts", generateAccessToken, (req, res) => {
  res.json(posts.filter(post=> post.username === req.user.name))
});

let refreshTokens = []


app.post('/token', (req,res)=>{
  const refreshToken = req.body.token
  if(refreshToken == null) return res.sendStatus(401)
  if (!refreshTokens.includes(refreshToken))return res.sendStatus(403)
  jwt.verify(refreshToken,process.env.REFRESH_TOKEN_SECRECT, (err,user) =>{
    if(err) return res.sendStatus(403)
    const accessToken = generateAccessToken({name:user.name})
    res.json({ accessToken:accessToken })
  })
})

app.delete('/logout', (req,res)=>{
    refreshTokens = refreshTokens.filter(token => token !== req.body.token)
    res.sendStatus(204)
})


app.post('/login', (req,res)=>{
    //Authenticate User
   
    // jwt.sign()
    const username = req.body.username
    const user ={name:username}

    const accessToken = generateAccessToken(user)
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRECT)
    refreshTokens.push(refreshToken)
    res.json({accessToken: accessToken, refreshToken: refreshToken})
})

function generateAccessToken(user){
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRECT,{ expiresIn: '20s'})
}

app.listen(4000);
