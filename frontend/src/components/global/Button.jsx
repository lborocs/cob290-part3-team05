const Button = (props) => {

  return (
    <>
        <button className= "flex bg-[var(--color-overlay))] text-white py-[0.5rem] space-x-[0.3rem]" onClick={props.Function}>
            {props.children}
        </button>
    </>
  )
}

export default Button