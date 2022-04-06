import { useSession, signIn } from 'next-auth/client';
import { api } from '../../services/api';
import { getStripeJs } from '../../services/stripe-js';
import styles from './styles.module.scss';

interface SubscribeButtonProps {
    priceId: string;
}

//locais abaixo onde usuario não acessa
//getServerSideProps (SSR)
//getStaticProps (SsG)
//api routes //quando acontece depois da pagina ser exibida

export function SubscribeButton({priceId}: SubscribeButtonProps){
    const [session] = useSession();

    async function handleSubscribe(){
        if(!session){
            signIn('github')
            return;
        }

        // criação da checkout session
        try{
            const response = await api.post('/subscribe')

            const { sessionId } = response.data;

            const stripe = await getStripeJs();

            await stripe.redirectToCheckout({ sessionId })
        } catch (err) {
            alert(err.message);
        }
    }

    return (
        <button 
        type="button"
        className={styles.subscribeButton}
        onClick={handleSubscribe}
        >
            Subscribe now
        </button>
    )
}