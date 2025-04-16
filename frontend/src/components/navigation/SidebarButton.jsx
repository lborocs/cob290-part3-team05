import React from 'react'

const SidebarButtonExpanded = ({className="",...props}) => {
    return (
        <>
        <button className= {`flex ${className}`} onClick={props.onClick}>
            {props.icon}
            {props.label}
        </button>
        </>
    )
}

const SidebarButtonMinimised = ({className="",...props}) => {
    return (
        <>
        <button className= {`flex ${className}`} onClick={props.onClick}>
            {props.icon}
        </button> 
        </>
    )
}

const SidebarButton = ({className="",...props}) => {
    
    const childrenArray = React.Children.toArray(props.children)
    const [icon,label] = childrenArray

    return (
        <>
        {!props.expanded 
        ? <SidebarButtonMinimised icon={icon} className={`flex ${className}`} onClick={props.onClick}/> 
        : <SidebarButtonExpanded icon={icon} label={label} className={`flex ${className}`} onClick={props.onClick}/>}
        </>
    )
}

export default SidebarButton
