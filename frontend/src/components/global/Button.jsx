const Button = ({className="",...props}) => {

  return (
    <>

        <button className= {`flex ${className}`} onClick={props.onClick}>
            {props.children}
        </button>
    </>
  )
}

export default Button