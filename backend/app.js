import express from 'express'

import { getExamples, getExample, createExample } from './database.js'

const app = express()

app.use(express.json())

app.get("/examples", async (req, res) => {
  const examples = await getExamples()
  res.send(examples)
})

app.get("/examples/:id", async (req, res) => {
  const id = req.params.id
  const example = await getExample(id)
  res.send(example)
})

app.post("/examples", async (req, res) => {
  const { title, contents } = req.body
  const example = await createExample(title, contents)
  res.status(201).send(example)
})


app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send('Server Error')
})

app.listen(8080, () => {
  console.log('Server is running on port 8080')
})