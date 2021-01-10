var amqp = require('amqplib')


async function ServerMQ() {

    const connection = await amqp.connect('amqps://gkcwrubi:0spPvx9eoZ6gwLFf1ZSHdk_WDkr6H_79@gull.rmq.cloudamqp.com/gkcwrubi')
    const channel = await connection.createChannel()
    const queue = 'task_queue';

    await channel.assertQueue(queue, { durable: true })
    await channel.prefetch(1);

    channel.consume(queue, (msg) => {
        console.log("[RECEIVE]")
        channel.ack(msg)
        between(channel, msg).then((res)=>{
            console.log(res);
        })
    }, {
        noAck: false
    })

}

function between(channel, msg) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {

            let variable = Math.floor(
                Math.random() * (1000 - 10) + 10
            )

            //Aqui es donde debe de declararse un nuevo canal
            channel.sendToQueue(msg.properties.replyTo, Buffer.from(variable.toString()), { persistent: true })
            resolve(variable)

        }, 10000)
    })
}

ServerMQ()