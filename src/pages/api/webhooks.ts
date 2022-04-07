import { NextApiRequest, NextApiResponse } from "next";
import { Readable } from 'stream';
import Stripe from "stripe";
import { stripe } from "../../services/stripe";

async function buffer(readable: Readable){
    const chunks = [];

    for await (const chunk of readable) {
        chunks.push(
            typeof chunk === "string" ? Buffer.from(chunk) : chunk
        );
    }

    return Buffer.concat(chunks);
}

// tenho que desabilitaer o entendimento padrão do next sobre o que está vindo da requisição
export const config = {
    api: {
        bodyParser: false
    }
}

const relevantEvent = new Set([
    'checkout.session.completed'
])

export default async (req: NextApiRequest, res: NextApiResponse) => {

    if(req.method === 'POST') {
        const buf = await buffer(req)
        const secret = req.headers['stripe-signature']

        let event: Stripe.Event;

        try{
            event = stripe.webhooks.constructEvent(buf, secret, process.env.STRIPE_WEBHOOK_SECRET); //se conseguir bater as srecret (secret, process.env.STRIPE_WEBHOOK_SECRET), STRIPE_WEBHOOK_SECRET é a gerada ao startar
        } catch(err){
            return res.status(400).send(`Webhook error: ${err.message}`);
        }

        const {type} = event;

        if(relevantEvent.has(type)){
            console.log('Evento recebido', event);
        }

        res.json({ received: true })
    }else {
        res.setHeader('Allow', 'POST')
        res.status(405).end('Method not allowed')
    }
}