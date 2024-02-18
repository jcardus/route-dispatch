import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react'
import { baseUri } from '../../modules/apis/straightaway'
import * as userProvider from '../../modules/user'
import getErrorMessage from '../../modules/utils/getErrorMessage'
import { User } from '@/types/Models'
import Modal from '../Modal'
import TakeoverModal from '../TakeoverModal'
import DataContextProvider from './DataContextProvider'
import {login} from "../../modules/apis/auth";

// Use undefined! to silence TS warning. We'll populate its values when the component is returned
const AppContext = createContext<AppContextProviderProps>(undefined!) // eslint-disable-line @typescript-eslint/no-non-null-assertion

// Unfortunately there isn't a good way (that I know of) to get the types implicitly since they're returned as a prop
// on AppContext. Declaring the type explicity for now.
interface AppContextProviderProps {
    user: User | undefined
    signOut: () => Promise<any>
    updateUser: (updatedUser: Partial<User>) => Promise<any>
    setError: (message?: string | undefined, details?: string | undefined) => void
    isDebugBuild: boolean
}

function AppContextProvider({ children, onSignOut }: { children: ReactNode; onSignOut: () => void }) {
    const [isAppInitialized, setIsAppInitialized] = useState(false)
    const [user, _setUser] = useState<User | undefined>(undefined)
    const [error, _setError] = useState<string | undefined>(undefined)

    const setUser = (newUser: User | undefined) => {
        _setUser(newUser)
    }

    const initialize = useCallback(async () => {
        const newUser = await userProvider.getCurrent()
        const traccarUser = await login()
        if (newUser) {
            // @ts-ignore
            setUser({...newUser, ...traccarUser})
        }

        setIsAppInitialized(true)
    }, [])

    const signOut = async () => {
        try {
            setUser(undefined)
            await userProvider.signOut()
            onSignOut()
        } catch (error) {
            setError('There was an error signing out', getErrorMessage(error))
        }
    }

    const updateUser = async (updatedUser: Partial<User>) => {
        const newUser = await userProvider.updateUser(updatedUser)
        setUser(newUser.data)
        return true
    }

    const setError = (message?: string, details?: string) => {
        if (details) {
            // error details logged to console for development
            console.error(details) // eslint-disable-line
        }
        _setError(message)
    }

    useEffect(() => {
        initialize()
    }, [initialize])

    return (
        <AppContext.Provider
            value={{
                user,
                signOut,
                updateUser,
                setError,
                isDebugBuild: baseUri?.includes('devapi.getstraightaway.com') === true
            }}
        >
                <DataContextProvider hasUser={user !== undefined}>
                    {isAppInitialized ? (
                        children
                    ) : (
                        <TakeoverModal>
                            <div className="ext-lg font-semibold text-blue text-center">Loading App...</div>
                        </TakeoverModal>
                    )}
                    {error && false && (
                        <Modal expandedOnLoad>
                            <p className="text-xl font-semibold mb-2">We&apos;re sorry, an error has occured</p>
                            <p>{error}</p>
                            <div className="flex-inline pt-5 text-right">
                                <button className="button flex-initial" onClick={() => setError(undefined, undefined)}>
                                    Dismiss
                                </button>
                            </div>
                        </Modal>
                    )}
                </DataContextProvider>
        </AppContext.Provider>
    )
}

export default AppContextProvider

export const useAppContext = () => {
    return useContext(AppContext)
}
