import {
    useState
} from 'react'
import {
    Helmet
} from 'react-helmet'
import {
    useForm
} from 'react-hook-form'
import {
    Link,
    useHistory
} from 'react-router-dom'
import ButtonWithSpinner from '../components/ButtonWithSpinner'
import {
    useDataContext
} from '../components/context/DataContextProvider'
import FormInput from '../components/FormInput'
import Modal from '../components/Modal'
import PhoneInput from '../components/PhoneInput'

const fields = {
    FIRSTNAME: 'given_name',
    LASTNAME: 'family_name',
    PHONE_NUMBER: 'phone_number'
}

const NewDriverPage = () => {
        const [loading, setLoading] = useState(false)
        const [errorMessage, setErrorMessage] = useState()
        const history = useHistory()
        const {
            inviteDriver
        } = useDataContext()
        const {
            register,
            handleSubmit,
            formState,
            control
        } = useForm({
            mode: 'onChange'
        })
        const {
            errors,
            isValid
        } = formState

        const onSubmit = (data) => {
            const submit = async () => {
                if (loading) return
                setLoading(true)
                try {
                    const response = await inviteDriver(
                        data[fields.PHONE_NUMBER],
                        data[fields.FIRSTNAME],
                        data[fields.LASTNAME]
                    )
                    if (response) {
                        onClose()
                    }
                } catch (err) {
                    setErrorMessage(err.message)
                } finally {
                    setLoading(false)
                }
            }
            setErrorMessage()
            submit()
        }

        const onClose = () => {
            history.push('/drivers')
        }

        return ( <
            Modal expandedOnLoad wrapContent onClose = {
                onClose
            } >
            <
            Helmet title = "Invite Driver | Fleetmap Route Dispatch" > < /Helmet> <
            form onSubmit = {
                handleSubmit(onSubmit)
            } >
            <
            h1 className = "text-xl font-semibold mb-4" > Invite Driver < /h1> <
            div className = "flex justify-between" >
            <
            FormInput className = "w-36"
            label = "First Name"
            inputProps = {
                register(fields.FIRSTNAME)
            }
            isError = {
                errors[fields.FIRSTNAME]
            }
            /> <
            FormInput className = "w-40"
            label = "Last Name"
            inputProps = {
                register(fields.LASTNAME)
            }
            isError = {
                errors[fields.LASTNAME]
            }
            /> <
            /div> <
            PhoneInput className = "w-80"
            label = "Phone Number"
            inputProps = {
                register(fields.FIRSTNAME)
            }
            fieldName = {
                fields.PHONE_NUMBER
            }
            isError = {
                errors[fields.EMAIL]
            }
            control = {
                control
            }
            /> <
            div className = "flex flex-row align-center" >
            <
            Link className = "button-light mr-2"
            to = "/drivers" >
            Cancel <
            /Link> <
            ButtonWithSpinner className = "button"
            loading = {
                loading
            }
            disabled = {!isValid
            } >
            Submit <
            /ButtonWithSpinner> <
            /div> {
                errorMessage && < p className = "mt-2 text-md font-semibold text-red" > {
                        errorMessage
                    } < /p>} <
                    /form> <
                    /Modal>
            )
        }

        export default NewDriverPage
