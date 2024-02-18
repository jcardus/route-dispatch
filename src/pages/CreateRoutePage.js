import { useState } from 'react'
import { Helmet } from 'react-helmet'
import { useForm } from 'react-hook-form'
import { Link, useHistory } from 'react-router-dom'
import ButtonWithSpinner from '../components/ButtonWithSpinner'
import { useAppContext } from '../components/context/AppContextProvider'
import { useDataContext } from '../components/context/DataContextProvider'
import FormInput from '../components/FormInput'
import Modal from '../components/Modal'
import { track } from '../modules/apis/segment'

const fields = {
    ROUTE_TITLE: 'title'
}

function CreateRoutePage() {
    const { createRoute } = useDataContext()
    const { user, isDebugBuild } = useAppContext()
    const fleet = user.fleet || {}
    const { register, handleSubmit, formState } = useForm({ mode: 'onChange' })
    const { errors, isValid } = formState
    const history = useHistory()
    const [loading, setLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState()

    const onSubmit = (data) => {
        const create = async () => {
            if (loading) return
            setLoading(true)

            try {
                const route = await createRoute({
                    stops: [],
                    start: fleet.start_persistent,
                    end: fleet.end_persistent,
                    ...data
                })

                if (route) {
                    history.push(`/routes/${route.id}/edit`)
                    track('Route Route Created', {
                        route_id: route.id,
                        source: 'Manual'
                    })
                }
            } catch (err) {
                setErrorMessage(err.message)
            } finally {
                setLoading(false)
            }
        }
        setErrorMessage()
        create()
    }

    return (
        <Modal expandedOnLoad wrapContent onClose={() => history.goBack()}>
            <Helmet title="Create Route | Mapbox Fleet Dashboard"></Helmet>
            <form onSubmit={handleSubmit(onSubmit)}>
                <h1 className="heading-2 pb-4 mb-2">Create a route</h1>
                <FormInput
                    className="w-96"
                    label="Route title"
                    inputProps={register(fields.ROUTE_TITLE, { required: true })}
                    isError={errors[fields.ROUTE_TITLE]}
                />
                <div className="flex items-center justify-center">
                    <Link className="button-light mx-1" to="/routes">
                        Cancel
                    </Link>

                    <ButtonWithSpinner className="button mx-1" loading={loading} disabled={!isValid}>
                        Add stops
                    </ButtonWithSpinner>
                </div>
            </form>
            {errorMessage && (
                <p className="mt-2 text-md font-semibold text-red">
                    An error occurred while creating your route. Please try again. {isDebugBuild && `(${errorMessage})`}
                </p>
            )}
        </Modal>
    )
}
export default CreateRoutePage
