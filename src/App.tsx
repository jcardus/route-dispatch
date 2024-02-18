import React, {useEffect, useState} from 'react'
import {Redirect, Route, Router, Switch} from 'react-router-dom'
import {SpinnerCircular} from 'spinners-react'
import AppContextProvider from './components/context/AppContextProvider'
import AccountLayout from './components/layout/AccountLayout'
import Layout from './components/layout/Layout'
import MapLayout from './components/layout/MapLayout'
import {login, MapboxSession} from './modules/apis/auth'
import AccountBillingPage from './pages/AccountBillingPage'
import AccountSettingsPage from './pages/AccountSettingsPage'
import DispatchDetailPage from './pages/DispatchDetailPage'
import DriverListPage from './pages/DriverListPage'
import RouteDetailPage from './pages/RouteDetailPage'
import RouteEditPage from './pages/RouteEditPage'
import RouteListPage from './pages/RouteListPage'
import SetDefaultPointsPage from './pages/SetDefaultPointsPage'
import {createBrowserHistory} from 'history';

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const origin = process.env.REACT_APP_ORIGIN_ACCOUNT!

const customHistory = createBrowserHistory();

function App() {
    const [session, setSession] = useState<MapboxSession | undefined>(undefined)

    useEffect(() => {
        if (!session) {
            const performLogin = async () => {
                try {
                    const session = await login() // ignore token for now since we don't use it
                    if (session) {
                        setSession(session)
                    }
                } catch (error) {
                    // In the event of an error, redirect the user to account.mapbox.com
                    const routeTo = `${window.location.protocol}//${window.location.host}`
                    window.open(window.location.href = `${origin}/?redirect=${encodeURIComponent(routeTo)}&desktop=1`)
                }
            }

            performLogin().then()
        }
    }, [session])

    if (!session) {
        return (
            <div className="h-screen flex justify-center items-center">
                <SpinnerCircular color="blue" secondaryColor="#e0e0e0" size={40} thickness={200} />
            </div>
        )
    }


    return (
        <Router history={customHistory}>
        <AppContextProvider onSignOut={() => setSession(undefined)}>
            <Layout>
                <Switch>
                    <Route path="/settings">
                        <AccountLayout>
                            <Switch>
                                <Route path="/settings" exact>
                                    <AccountSettingsPage />
                                </Route>
                                <Route path="/settings/billing" exact>
                                    <AccountBillingPage />
                                </Route>
                            </Switch>
                        </AccountLayout>
                    </Route>
                    <Route path="/">
                        <MapLayout>
                            <Switch>
                                <Route path="/" exact>
                                    <Redirect to="/routes" />
                                </Route>
                                <Route path={['/routes', '/routes/new', '/routes/import']} exact>
                                    <RouteListPage />
                                </Route>
                                <Route path="/routes/default-points">
                                    <SetDefaultPointsPage />
                                </Route>
                                <Route path={['/routes/:routeId', '/routes/:routeId/dispatch']} exact>
                                    <RouteDetailPage />
                                </Route>
                                <Route path={['/dispatches/:dispatchId']} exact>
                                    <DispatchDetailPage />
                                </Route>
                                <Route path="/routes/:routeId/edit" exact>
                                    <RouteEditPage />
                                </Route>
                                <Route path={['/drivers', '/drivers/new']} exact>
                                    <DriverListPage />
                                </Route>
                            </Switch>
                        </MapLayout>
                    </Route>
                </Switch>
            </Layout>
        </AppContextProvider>
        </Router>
    )
}

export default App
