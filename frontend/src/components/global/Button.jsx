const Button = (props) => {

  return (
    <>
        <button className= "flex bg-blue-500 text-white" onClick={props.Function}>
            {props.children}
        </button>
    </>
  )
}

export default Button