import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaCircleInfo } from "react-icons/fa6";
import { ImCross } from "react-icons/im";
import logo from "../assets/img/make-it-all-icon.png";

const Login = () => {
  // State variable to control the visibility of the right box
  const navigate = useNavigate();

  //States for Validation (Add more if needed)
  const responseState = {
    STANDARD: "standard",
    EMPTY: "empty",
    EMPTY2: "confirm empty",
    INVALID: "invalid",
    NOMATCH: "no match",
  };

  //Active Menu
  const [createNewAccount, setCreateNewAccount] = useState(false);

  //Login Email Address
  const [loginName, setLoginName] = useState("");
  const [loginNameState, setLoginNameState] = useState(responseState.STANDARD);

  //Login Password
  const [loginPassword, setLoginPass] = useState("");
  const [loginPasswordState, setLoginPassState] = useState(
    responseState.STANDARD
  );
  const [passwordVisibility, toggleVisibility] = useState(false);

  //Login Remember Password (How)
  const [loginRemember, setLoginRemember] = useState(true);

  //Create New Email
  const [createName, setCreateName] = useState("");
  const [createNameState, setCreateNameState] = useState(
    responseState.STANDARD
  );

  //Create New Password
  const [createPassword, setCreatePass] = useState("");
  const [confirmPassword, setConfirmPass] = useState("");
  const [confirmPasswordState, setConfirmPassState] = useState(
    responseState.STANDARD
  );
  const [createPasswordVisibility, toggleVisibilityCreate] = useState(false);
  const [passwordVisibilityConfirm, toggleVisibilityConfirm] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  //Terms of Service
  const [terms, setTerms] = useState(false);
  const [termsState, setTermsState] = useState(responseState.STANDARD);

  //=======================================================================================================================================================================================

  // Checkboxes & Toggles
  const toggleRightBox = () => {
    setCreateNewAccount((prev) => !prev); // Function to toggle the visibility of the right box
  };

  const toggleLoginRemember = () => {
    setLoginRemember(!loginRemember); // Toggle checkbox state
  };

  const toggleTerms = () => {
    setTerms(!terms); // Toggle T&C state
  };

  const toggleInfo = () => {
    setShowInfo(!showInfo); //Toggle password info
  };
  //=======================================================================================================================================================================================

  const toDashboard = () => {
    return "/dashboard";
  };

  //=======================================================================================================================================================================================

  const login = async () => {
    setLoginNameState(responseState.STANDARD);
    setLoginPassState(responseState.STANDARD);

    // Presence check Email
    if (!loginName) {
      setLoginNameState(responseState.EMPTY);
      return false;
    }

    // Presence check Password
    if (!loginPassword) {
      setLoginPassState(responseState.EMPTY);
      return false;
    }

    // Create Form Structure
    const loginData = {
      email: loginName,
      password: loginPassword,
    };

    // API Request
    try {
      console.log("Sending login request with:", loginData);

      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();
      console.log("Response data:", data);

      if (response.ok) {
        if (data.accessToken) {
          // Store the token in localStorage for future API requests
          localStorage.setItem("token", data.accessToken);
          if (data.user) {
            localStorage.setItem("user", JSON.stringify(data.user));
          }

          console.log("Login successful, navigating to dashboard");
          navigate("/"); // Go to dashboard page
        } else {
          console.error("Missing accessToken in successful response");
          alert(
            "Login successful but session data is incomplete. Please try again."
          );
        }
      } else {
        // Handle error responses
        console.error("Login failed:", data.message || "Unknown error");

        if (response.status === 401) {
          setLoginPassState(responseState.INVALID);
        } else if (response.status === 400) {
          if (data.message?.toLowerCase().includes("email")) {
            setLoginNameState(responseState.INVALID);
          } else {
            setLoginPassState(responseState.INVALID);
          }
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("An error occurred during login. Please try again later.");
    }
  };

  const validateEmail = (x, setState) => {
    //Presence check
    if (!x) {
      setState(responseState.EMPTY);
      return false;
    }

    //Regex Structure check
    const regex = /^[\w\.-]+@make-it-all\.co\.uk$/;
    if (!regex.test(x)) {
      setState(responseState.INVALID);
      return false;
    }

    setState(responseState.STANDARD);
    return true;
  };

  //=======================================================================================================================================================================================

  const signup = async () => {
    setCreateNameState(responseState.STANDARD);
    setConfirmPassState(responseState.STANDARD);
    setTermsState(responseState.STANDARD);

    const resultEmail = validateEmail(createName, setCreateNameState);
    if (!resultEmail) {
      return false;
    }

    const resultPassword = validateSignupPassword(
      createPassword,
      confirmPassword,
      setConfirmPassState
    );
    if (!resultPassword) {
      return false;
    }

    if (!terms) {
      setTermsState(responseState.EMPTY);
      return false;
    }

    const signupData = JSON.stringify({
      email: createName,
      password: createPassword,
      password2: confirmPassword,
    });

    //SQL Query
    try {
      const response = await fetch("/api/login/signup.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: signupData,
      });

      const data = await response.json();

      //Query outcomes
      if (data.success) {
        alert(
          "Account Created,\nAn Admin will need to Activate your account before you can log in!"
        );
        //navigate(toDashboard());
      } else if (data.error) {
        //This feels like a crime with so many ifs, but i can't be bothered to fix the mess right now, too little time left
        if (data.error === "Email is Required") {
          setCreateNameState(responseState.EMPTY);
        } else if (data.error === "Password is Required") {
          setConfirmPassState(responseState.EMPTY);
        } else if (data.error === "Confirm Password") {
          setConfirmPassState(responseState.EMPTY2);
        } else if (
          data.error === "Invalid Email" ||
          data.error === "Email already taken!"
        ) {
          setCreateNameState(responseState.INVALID);
        } else if (data.error === "Invalid Password") {
          setCreatePassState(responseState.INVALID);
        } else if (data.error === "Passwords do not match!") {
          setCreatePassState(responseState.NOMATCH);
        }
      } else {
        throw new Error("Unexpected Failure, response from server is invalid");
      }
    } catch (error) {
      throw new Error("An error occurred. Please try again.");
    }
  };

  const validateSignupPassword = (x, y, setState) => {
    // Criteria for standard password
    const passwordCriteria = {
      length: x.length >= 8,
      upper: /[A-Z]/.test(x),
      lower: /[a-z]/.test(x),
      number: /[0-9]/.test(x),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(x),
    };

    const checkPassword = Object.values(passwordCriteria).every(Boolean);

    if (!x) {
      setState(responseState.EMPTY);
      return false;
    }
    // Checks if password meets criteria
    if (!checkPassword) {
      setState(responseState.INVALID);
      return false;
    }
    if (!y) {
      setState(responseState.EMPTY2);
      return false;
    }
    if (x !== y) {
      setState(responseState.NOMATCH);
      return false;
    }
    // Proceed if 3 conditions are met
    setState(responseState.STANDARD);
    return true;
  };

  //=======================================================================================================================================================================================

  return (
    <>
      {/*Background*/}
      <div
        className={`flex flex-col w-[100vw] px-[2.5vw] py-4 min-h-[100dvh] w-max-screen bg-[var(--color-overlay)] shadow-[inset_195px_1px_179.4px_0px_rgba(0,0,0,0.57)] relative items-center justify-center overflow-visible lg:overflow-auto`}
      >
        <div className="absolute top-[50px] left-1/2 transform -translate-x-1/2 z-40 inline-flex mb-10 gap-x-3 items-center lg:left-[20px] lg:top-[20px] lg:transform-none ">
          {/* logo */}
          <img
            src={logo}
            alt="Make-It-All Logo"
            className="max-w-[45px] max-h-[45px] rounded-lg border-2 border-[var(--color-overlay)] lg:border-none"
          ></img>
          {/* name beside logo */}
          <h2 className="text-lg font-bold text-[var(--color-black)] lg:text-[var(--color-white)]">
            Make-it-all
          </h2>
        </div>

        {/*Full container, Section 1 is Stacking/Side by side, 2 is scaling*/}
        <div
          className={`flex ${
            createNewAccount
              ? "flex-col lg:flex-row justify-center"
              : "flex-row"
          }  
                  ${
                    createNewAccount
                      ? "w-[100vw] lg:w-[70vw]"
                      : "w-[100vw] lg:w-[40vw]"
                  } 
                  bg-[var(--color-subtitle)] rounded-[3rem] shadow-lg)
                  max-w-[90vw] flex-grow mx-2 lg:my-[10vh] h-auto lg:min-h-[70vh] lg:mx-[0]`}
        >
          {/* White box */}
          <div
            className={`flex flex-col flex-grow w-[90%] lg:w-[40%]
                ${createNewAccount ? "hidden lg:flex" : "flex"} 
                bg-[var(--color-component)] rounded-[3rem] shadow-md justify-start items-center
                min-h-full relative`}
          >
            <div className="flex flex-col flex-grow min-h-4/5 w-[90%] lg:w-[60%] justify-center lg:justify-start">
              <span className="text-[var(--color-subtitle)] font-inter text-4xl mt-8 font-extrabold leading-[29.05px] lg:mt-[20vh] text-center">
                Login
              </span>
              <form className="flex flex-col mt-4 min-w-fit justify-center items-center">
                {/*Username*/}

                <input
                  className={`${
                    loginNameState === responseState.STANDARD
                      ? "border-[var(--color-black)]"
                      : "border-red-500"
                  }
                    max-w-[400px] w-[100%] bg-inherit border-2 border-login-entry rounded-md p-2 mt-6 mx-auto shadow-lg text-[var(--color-black)]`}
                  type="text"
                  placeholder="Email"
                  value={loginName}
                  onChange={(e) => setLoginName(e.target.value)}
                />
                {/*Username is valid*/}
                <span className="pl-[5px] text-sm text-red-500 text-left w-full max-w-[400px] h-[1.25rem]">
                  {loginNameState === responseState.STANDARD && " "}
                  {loginNameState === responseState.EMPTY &&
                    "Please enter your email address."}
                  {loginNameState === responseState.INVALID &&
                    "Please enter a valid email."}
                </span>

                {/*Password*/}
                <div className="relative max-w-[400px] w-[100%] bg-inherit rounded-md mt-1">
                  <input
                    className={`${
                      loginPasswordState === responseState.STANDARD
                        ? "border-[var(--color-black)]"
                        : "border-red-500"
                    }
                    pr-10 right-2 max-w-[400px] w-[100%] bg-inherit border-2 border-login-entry rounded-md p-2 mx-auto shadow-lg text-[var(--color-black)]`}
                    type={passwordVisibility ? "text" : "password"}
                    placeholder="Password"
                    value={loginPassword}
                    onChange={(e) => setLoginPass(e.target.value)}
                  />
                  {loginPassword && (
                    <span
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
                      onMouseOver={() => toggleVisibility(true)}
                      onMouseLeave={() => toggleVisibility(false)}
                    >
                      <FaEye />
                    </span>
                  )}
                </div>
                {/*Password is valid*/}
                <span className="pl-[5px] text-sm text-red-500 text-left w-full max-w-[400px] h-[1.25rem]">
                  {loginPasswordState === responseState.STANDARD && " "}
                  {loginPasswordState === responseState.EMPTY &&
                    "Please enter your password."}
                  {loginPasswordState === responseState.INVALID &&
                    "The password you entered is incorrect. Please try again."}
                </span>

                {/*Forget my details*/}
                <div className="px-4 mt-2 flex justify-start">
                  <input
                    className="bg-transparent"
                    type="checkbox"
                    id="loginRemember"
                    checked={loginRemember}
                    onChange={toggleLoginRemember}
                  />
                  <label
                    className="text-sm lg:text-back pl-2 text-[var(--color-black)]"
                    htmlFor="loginRemember"
                  >
                    Remember my details
                  </label>
                  <br></br>
                </div>
              </form>

              <button
                onClick={login}
                className={`mt-4 p-2 bg-[var(--color-overlay)] text-[var(--color-white)] rounded mx-auto hover:bg-[var(--color-hover)]`}
              >
                Log in
              </button>
              <button
                onClick={toggleRightBox}
                className={`mt-4 p-2 bg-transparent text-[var(--color-black)] rounded mx-auto ${
                  createNewAccount ? "hidden" : ""
                }`}
              >
                Sign Up
              </button>
            </div>
          </div>

          {/* Gray box details */}
          {createNewAccount && (
            <div
              className={`flex flex-col flex-grow ${
                createNewAccount ? "visible" : "invisible lg:visible"
              } 
                        rounded-[3rem] bg-inherit justify-center lg:justify-start w-[100%] lg:w-[60%] min-h-[90vh] lg:min-h-full items-center my-4 lg:my-0 relative`}
            >
              {/* Red circular div in the top right corner, closes sign up tab */}
              <div
                className="absolute lg:top-[40px] top-[20px] right-[40px] w-10 h-10 bg-[#ff3838] rounded-full border-[3px] border-[#777777] flex items-center justify-center cursor-pointer"
                onClick={toggleRightBox}
              >
                <span>
                  <ImCross className="text-[var(--color-disabled)]" />
                </span>
              </div>

              {/*Show password creation info*/}
              {showInfo && (
                <div
                  onClick={() => setShowInfo(false)}
                  className="rounded-[3rem]
            absolute h-full inset-0 flex items-center justify-center bg-[var(--color-black)] bg-opacity-50 z-40"
                >
                  <div className="bg-[var(--color-white)] p-6 rounded-lg shadow-lg w-80 relative z-50">
                    <p className="text-lg font-semibold mb-4 underline text-[var(--color-black)]">
                      Password Requirements
                    </p>
                    <ul className="list-disc list-inside text-gray-700">
                      <li>At least 8 characters</li>
                      <li>Uppercase letter</li>
                      <li>Lowercase letter</li>
                      <li>Number</li>
                      <li>Special character</li>
                    </ul>
                  </div>
                </div>
              )}

              <div className="flex flex-col flex-grow min-h-[calc(80%-5rem)] w-[90%] lg:w-[60%] justify-center lg:justify-start">
                <span className="text-[var(--color-white)] font-inter text-4xl mt-8 font-extrabold leading-[29.05px] lg:mt-[calc(20vh)] text-center">
                  Create Account
                </span>
                <form className="flex flex-col mt-4 min-w-fit justify-center items-center">
                  {/*Username*/}
                  <input
                    className={`${
                      createNameState === responseState.STANDARD
                        ? "border-[var(--color-black)]"
                        : "border-red-500"
                    }
                            max-w-[400px] w-[100%] bg-[var(--color-component)] border-2 border-login-entry rounded-md p-2 mt-6 mx-auto shadow-lg text-[var(--color-black)]`}
                    type="text"
                    placeholder="Email"
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                  />
                  {/*Username is valid*/}
                  <span className="pl-[5px] text-sm text-red-500 text-left w-full max-w-[400px] h-[1.25rem]">
                    {createNameState === responseState.STANDARD && " "}
                    {createNameState === responseState.EMPTY &&
                      "Please enter your email address."}
                    {createNameState === responseState.INVALID &&
                      "Please enter a valid email."}
                  </span>
                  {/*Password*/}

                  <div className="relative max-w-[400px] w-[100%] bg-inherit rounded-md mt-1">
                    <input
                      className={`${
                        confirmPasswordState === responseState.EMPTY ||
                        confirmPasswordState === responseState.INVALID
                          ? "border-red-500"
                          : "border-[var(--color-black)]"
                      }
                                pr-10 right-2 max-w-[400px] w-[100%] bg-[var(--color-component)] border-2 border-login-entry rounded-md p-2 mx-auto shadow-lg text-[var(--color-black)]`}
                      type={createPasswordVisibility ? "text" : "password"}
                      placeholder="Create Strong Password"
                      value={createPassword}
                      onChange={(e) => setCreatePass(e.target.value)}
                    />
                    {createPassword && (
                      <span
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
                        onMouseOver={() => toggleVisibilityCreate(true)}
                        onMouseLeave={() => toggleVisibilityCreate(false)}
                      >
                        <FaEye />
                      </span>
                    )}

                    {/*Password Requirement Icon*/}
                    <span className="absolute right-[-17px] lg:right-[-30px] top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500">
                      <FaCircleInfo onClick={toggleInfo} />
                    </span>
                  </div>

                  {/*Password is valid (2)*/}
                  <span className="pl-[5px] text-sm text-red-500 text-left w-full max-w-[400px] h-[1.25rem]">
                    {confirmPasswordState === responseState.STANDARD && " "}
                    {confirmPasswordState === responseState.EMPTY &&
                      "Please enter your password."}
                    {confirmPasswordState === responseState.INVALID &&
                      "Password does not meet requirements."}
                  </span>

                  {/*Confirm Password*/}
                  <div className="relative max-w-[400px] w-[100%] bg-inherit rounded-md">
                    <input
                      className={`${
                        confirmPasswordState === responseState.EMPTY2 ||
                        confirmPasswordState === responseState.NOMATCH
                          ? "border-red-500"
                          : "border-[var(--color-black)]"
                      }
                                pr-10 right-2 max-w-[400px] w-[100%] bg-[var(--color-component)] border-2 border-login-entry rounded-md p-2 mx-auto shadow-lg text-[var(--color-black)]`}
                      type={passwordVisibilityConfirm ? "text" : "password"}
                      placeholder="Confirm Strong Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPass(e.target.value)}
                    />
                    {confirmPassword && (
                      <span
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
                        onMouseOver={() => toggleVisibilityConfirm(true)}
                        onMouseLeave={() => toggleVisibilityConfirm(false)}
                      >
                        <FaEye />
                      </span>
                    )}
                  </div>
                  {/*Password is valid (2)*/}
                  <span className="pl-[5px] text-sm text-red-500 text-left w-full max-w-[400px] h-[1.25rem]">
                    {confirmPasswordState === responseState.STANDARD && " "}
                    {confirmPasswordState === responseState.EMPTY2 &&
                      "Please confirm your password."}
                    {confirmPasswordState === responseState.NOMATCH &&
                      "Passwords do not match."}
                  </span>
                  {/*Terms and Conditions*/}
                  <div className="px-4 mt-2 flex justify-start">
                    <input
                      className="bg-transparent"
                      type="checkbox"
                      id="termsConditions"
                      checked={terms}
                      onChange={toggleTerms}
                    />
                    <label
                      className="text-sm lg:text-[var(--color-white)] pl-2 text-[var(--color-white)]"
                      htmlFor="termsConditions"
                    >
                      I accept the terms and conditions
                    </label>
                    <br></br>
                  </div>
                  {/*Terms and conditions accepted*/}
                  <span className="pl-[5px] text-sm text-red-500 text-left w-full max-w-[400px] h-[1.25rem]">
                    {termsState === responseState.STANDARD && " "}
                    {termsState === responseState.EMPTY &&
                      "Please accept the terms and conditions."}
                  </span>
                </form>
                <button
                  onClick={signup}
                  className={`mt-4 p-2 bg-[var(--color-overlay)] text-[var(--color-white)] rounded mx-auto hover:bg-[var(--color-hover)]`}
                >
                  Sign Up
                </button>
                <button
                  onClick={toggleRightBox}
                  className="mt-4 p-2 bg-transparent text-[var(--color-white)] rounded mx-auto underline lg:hidden"
                >
                  Log in Instead
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Login;
