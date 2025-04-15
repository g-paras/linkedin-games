import { signInWithGooglePopup } from '@/firebase'

const googleLogin = () => {
    signInWithGooglePopup().then(res => console.log(res))
}

const SignInWithGoogle = () => {
    return <button onClick={googleLogin}>test login</button>
}

export default SignInWithGoogle;