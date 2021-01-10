const { ApolloServer, gql } = require('apollo-server')
const amqp = require('amqplib')

async function MQClient() {

  const connection = await amqp.connect('amqps://gkcwrubi:0spPvx9eoZ6gwLFf1ZSHdk_WDkr6H_79@gull.rmq.cloudamqp.com/gkcwrubi')

  const typeDefs = gql`

  type Query {
    text: String
  }
`
  const resolvers = {
    Query: {
      text: async () => await send(connection)
    },
  }

  const server = new ApolloServer({ typeDefs, resolvers })

  server.listen().then(({ url }) => {
    console.log(`Server ready at ${url}`)
  })
}

function send(connection) {
  return new Promise((resolve, reject) => {
    console.log('[Me llamaron]')
    connection.createChannel().then((channel) => {
      channel.prefetch(1).then(() => {
        channel.assertQueue('', { durable: true })
          .then(({ queue }) => {
            channel.sendToQueue('task_queue', Buffer.from('Tarea en proceso'), { persistent: true, replyTo: queue })
            console.log('[SEND]')
            channel.consume(queue, (msg) => {
              console.log(msg.content.toString());
              channel.ack(msg)
              resolve(msg.content.toString())
            }, {
              noAck: false
            })
          })
      })
    })

  })
}

function sendTest() {
  return new Promise((resolve, reject) => {
    console.log('[ME LLAMARON]');
    setTimeout(() => {
      console.log('[TERMINÉ]');
      resolve(Math.floor(
        Math.random() * (1000 - 10) + 10
      ))
    }, 20000)
  })
}

MQClient()