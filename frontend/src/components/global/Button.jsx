const Button = ({Text,Function,className}) => {

  return (
    <>
        <button className= "flex bg-blue-500 text-white" onClick={Function}>
            {Text}
        </button>
    </>
  )
}

export default Button