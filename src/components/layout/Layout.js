import MainNavigation from './MainNavigation'

function Layout(props) {
    return ( <div className = "text-base h-screen" >
        <MainNavigation /> {
            props.children
        } </div>
    )
}

export default Layout
