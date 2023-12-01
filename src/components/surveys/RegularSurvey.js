import React, { useState, Fragment, useRef } from 'react'
import { retrieveCookie } from '../../lib/session';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useDispatch } from 'react-redux';
import { toggleSurvey } from '../../redux/appStateSlice';

function RegularSurvey() {
    let [questions, setQuestions] = useState([
        {question:"Would adding a stop button be useful?", rating:0},
        {question:"Would adding text input be useful?", rating:0},
        {question:"Would adding conversation history be useful?", rating:0},
        {question:"Would sending emails directly be useful?", rating:0},
    ])
    const [isFormComplete, setIsFormComplete] = useState(false);
    const [additionalThoughts, setAdditionalThoughts] = useState("");
    const [furtherAdditionalThoughts, setFurtherAdditionalThoughts] = useState("");
    const [isSurveyAlreadyFilled, setIsSurveyAlreadyFilled] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [furtherAdditionalThoughtsSubmitted, setFurtherAdditionalThoughtsSubmitted] = useState(false);
    const registrationEmailRef = useRef(null)
    const dispatch = useDispatch();
    const closeSurvey = ()=>{
        dispatch(toggleSurvey(false))
    }
    const updateAdditionalThoughts = (e)=>{
        const {value} = e.target
        setAdditionalThoughts(value)
    }

    const updateFurtherAdditionalThoughts = (e) => {
        const {value} = e.target;
        setFurtherAdditionalThoughts(value);
    }

    const rateQuestion = (value, index) => {
        questions[index].rating = value
        setQuestions([...questions])
    }

    const validate = () => {
        for (let q of questions){
            if (!q.rating) {
                alert("Please rate all questions")
                return false
            }
        }
        return true
    }

    const submit = (e) => {
        const oauthCode = retrieveCookie("voiceGPTAuthToken");
        if (!validate()) return
        const payLoad = {oauthCode, questions, additionalThoughts}
        setIsSubmitting(true)

         fetch("/api/voicegptprompt",{method: "POST", body:JSON.stringify(payLoad)})
         .then(r => {
            if (r.ok) r.json()
            .then(data => 
                    {
                        if(data.status == 200) setIsFormComplete(true)
                        if(data.status == 400) {
                            setIsSurveyAlreadyFilled(true)
                            setIsFormComplete(true)
                        }
                        setIsSubmitting(false)
                    }
            )
            .catch(e=>{
                console.log(e)
                alert("Could not submit survey.")
                setIsSubmitting(false)
            })
        }) 
         .catch(e => {
            console.error(e)
            alert("Could not submit survey.")
            setIsSubmitting(false)
        });
    }

    const submitRegistrationEmail = (e)=> {
        const emailRegex  = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/
        if(registrationEmailRef.current.value.length === 0) return;
        if (!emailRegex.test(registrationEmailRef.current.value)){
            alert("Please enter a valid email")
            return
        }
        const oauthCode = retrieveCookie("voiceGPTAuthToken");
        const payLoad = {oauthCode, registrationEmail:registrationEmailRef.current.value}
        setIsSubmitting(true)
         fetch("/api/voicegptprompt",{method: "POST", body:JSON.stringify(payLoad)})
         .then(r => {
            if (r.ok) r.json()
            .then(data => 
                    {
                        if(data.status == 200){ 
                            setFurtherAdditionalThoughtsSubmitted(true)
                            setIsSurveyAlreadyFilled(true)
                            setIsFormComplete(true)
                        }
                        // if(data.status == 400) {
                        //     setIsSurveyAlreadyFilled(true)
                        //     setIsFormComplete(true)
                        // }
                        setIsSubmitting(false)
                    }
            )
            .catch(e=>{
                console.log(e)
                alert("Could not submit further feedback.")
                setIsSubmitting(false)
            })
        }) 
         .catch(e => {
            console.error(e)
            alert("Could not reach endpoint for further feedback.")
            setIsSubmitting(false)
        });

    }

    const submitFurtherFeedBack = () =>  {
        if(furtherAdditionalThoughts.length === 0) return;
        const oauthCode = retrieveCookie("voiceGPTAuthToken");
        const payLoad = {oauthCode, furtherAdditionalThoughts}
        setIsSubmitting(true)
        fetch("/api/voicegptprompt",{method: "POST", body:JSON.stringify(payLoad)})
         .then(r => {
            if (r.ok) r.json()
            .then(data => 
                    {
                        if(data.status == 200) {
                            setFurtherAdditionalThoughtsSubmitted(true)
                            setIsSurveyAlreadyFilled(true)
                            setIsFormComplete(true)
                        }
                        if(data.status == 400) {
                            setIsSurveyAlreadyFilled(true)
                            setIsFormComplete(true)
                        }
                        setIsSubmitting(false)
                    }
            )
            .catch(e=>{
                console.log(e)
                alert("Could not submit registration email.")
                setIsSubmitting(false)
            })
        }) 
         .catch(e => {
            console.error(e)
            alert("Could not reach endpoint for submitting registration email.")
            setIsSubmitting(false)
        });
    }

  return <div className='h-screen w-full flex items-center justify-center'>
        <div className={`rounded-xl bg-[#202123] flex flex-col items-center shadow-lg ${isFormComplete ? isSurveyAlreadyFilled? 'h-1/2 px-6 w-1/2' : 'h-1/2 w-1/2' :'h-5/6 max-h-[800px]'} py-3`}>
            <div className={`w-full flex justify-end ${isSurveyAlreadyFilled ? '' :'px-4'}`}>
                <button onClick={closeSurvey} className='rounded-full flex justify-center items-center w-[25px] h-[25px] hover:bg-gray-500'>
                    <XMarkIcon color='white' width={20} height={20}/>
                </button>
            </div>
            {isFormComplete ?
                isSurveyAlreadyFilled ? 
                <>
                    {
                        !furtherAdditionalThoughtsSubmitted ? (
                            <>
                                <h1 className='text-gray-300 font-bold text-xs xs:text-sm md:text-lg lg:text-xl text-justify'>
                                    It appears you have already left feedback. However, feel free to fill out the box below if you have additional thoughts.
                                </h1>
                                <textarea maxLength={100} onChange={updateFurtherAdditionalThoughts} value={furtherAdditionalThoughts} className='bg-gray-100 w-full rounded-lg mt-6 text-black p-2 text-sm outline-none'/>
                                <div className='text-white flex w-full mt-6'>
                                    <button onClick={submitFurtherFeedBack} className='bg-green-500 rounded-lg text-xs xs:text-sm md:text-lg lg:text-xl py-2 px-4 xs:px-6 '>
                                        {isSubmitting ? "Submitting" : "Submit"}
                                    </button>
                                </div>
                            </>
                        )
                        :
                        (
                            <>
                                <h1 className='text-gray-300 mt-4 font-bold text-xs xs:text-sm md:text-lg lg:text-xl text-justify'>
                                    Thanks for taking the time to give us your feedback!
                                </h1>
                                <div className='h-[140px] sm:h-1/2'></div>
                                <button onClick={closeSurvey} className='bg-gray-500 text-white rounded-lg text-xs xs:text-sm md:text-lg lg:text-xl py-2 px-4 xs:px-6 '>
                                        {"Close"}
                                </button>
                            </>
                        )
                    }
                </> :
                <>
                    <h1 className='text-gray-300 font-bold text-xs xs:text-sm md:text-lg lg:text-xl'>Stand a chance to win!</h1>
                    <div className='w-full px-4'>
                        <p className='text-gray-300 mx-2 mt-2 text-xs xs:text-sm md:text-lg text-justify'>Congratulations! Please enter your email to registered in the draw. We will notify you if you win!</p>
                        <input ref={registrationEmailRef} type='email' className='outline-none rounded-sm w-full mt-4 p-2' placeholder='e.g. yourname@gmail.com'/>
                    </div>
                    {/* <div className='grow'></div> */}
                    {/* <div className='rounded-lg p-2 w-1/2 border border-gray-500 flex items-center justify-center overflow-hidden mt-4'>
                        <h1 className='text-gray-300 text-xs xs:text-sm md:text-lg'>Code: SDKS787*&*SDSlksaj</h1>
                    </div> */}
                     <button onClick={submitRegistrationEmail} className='bg-green-500 rounded-lg mt-8 text-white text-xs xs:text-sm md:text-lg lg:text-xl py-2 px-4 xs:px-6 '>
                            { isSubmitting ? "Submitting..." : "Submit"}
                    </button>
                </>
                :
                <>
                    <h1 className='text-gray-300 font-bold text-xs xs:text-sm md:text-lg lg:text-xl'>Win A Reward By Helping Us Improve</h1>
                    <h1 className='text-gray-300 mt-2 text-xs xs:text-sm md:text-lg'>Answer the questions below to win.</h1>
                    <div className='text-gray-300 mt-2 flex flex-col items-center justify-between grow  px-10 sm:px-12'>
                        {
                            questions.map(
                                    (q, index) => (
                                        <Fragment key={index}>
                                            <p key={index} className='w-full text-justify text-xs xs:text-sm md:text-lg lg:text-xl'>{index+1}. {q.question}</p>
                                            <div key={`${index}ratingContainer`} className='flex justify-between w-full'>
                                                {
                                                    [1,2,3,4,5].map(
                                                        (v, i) => <button onClick={() => rateQuestion(v,index)} key={`${index}:${i}`} className={`hover:bg-gray-500 ${q.rating == i+1 && 'bg-gray-500'} border border-gray-100 flex justify-center items-center rounded-lg p-2 text-xs md:text-lg w-[35px] h-[35px] xs:w-10 xs:h-10 md:w-12 md:h-12 `}>{v}</button>
                                                    )
                                                }
                                            </div>
                                        </Fragment>
                                    )
                            )
                        }
                        <p className='text-gray-300 w-full text-justify text-xs xs:text-sm md:text-lg lg:text-xl'>{questions.length+1}. Any additional thoughts?{" (Optional)"}</p>
                        <div className='text-gray-300 flex w-full'>
                            <textarea maxLength={5000} onChange={updateAdditionalThoughts} value={additionalThoughts} className='bg-gray-100 w-full rounded-lg text-black p-2 text-sm outline-none'/>
                        </div>
                    </div>
                    <div className='text-white flex w-full mt-6 px-10 sm:px-12'>
                        <button onClick={submit} className='bg-green-500 rounded-lg text-xs xs:text-sm md:text-lg lg:text-xl py-2 px-4 xs:px-6 '>
                            {isSubmitting? "Submitting...": "Submit"}
                        </button>
                    </div>
                </>
            }
      

        </div>
  </div>
}

export default RegularSurvey
