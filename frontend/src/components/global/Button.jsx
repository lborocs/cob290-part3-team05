const Button = ({Text,Function,className}) => {

  return (
    <>
        <button className= "flex bg-mint-500 text-white" onClick={Function}>
            {Text}
        </button>
    </>
  )
}

export default Button