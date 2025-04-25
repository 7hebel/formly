import Squares from '../blocks/Backgrounds/Squares.jsx';
import RotatingText from '../blocks/TextAnimations/RotatingText.jsx';
import InfiniteScroll from '../blocks/Components/InfiniteScroll.jsx';
import { PrimaryButton, SecondaryButton, TertiaryButton } from '../ui/Button.jsx';
import { UserPlus, LayoutDashboard, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import './styles/header.css'
import './styles/home.css'
import './styles/_responsive.css'
import { getAnswerComponentBuilder } from '../formComponents/AllComponents.jsx'

export default function Home() {
  const navigate = useNavigate();
  const [isLogged, setIsLogged] = useState(false);
  
  useEffect(() => {
    const savedUuid = localStorage.getItem('uuid');
    if (!savedUuid) return;

    const requestOptions = {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    };

    fetch(import.meta.env.VITE_API_URL + "/autologinCheck/" + savedUuid, requestOptions)
      .then(response => response.json())
      .then(response => {
        if (response.status === false) {
          localStorage.setItem('uuid', "");
          sessionStorage.setItem("session-accepted", 0);
          setIsLogged(false);
          console.warn(`Autologin to: '${savedUuid}' rejected by API with reason: '${response.err_msg}'`);
        } else {
          localStorage.setItem("fullname", response.data.fullname);
          localStorage.setItem("email", response.data.email);
          sessionStorage.setItem('session-accepted', 1);
          setIsLogged(true);
          console.log(`Autologin successful to: '${savedUuid}'`);
        }
      })
      .catch(err => {
        localStorage.setItem('uuid', "");
        sessionStorage.setItem("session-accepted", 0);
        setIsLogged(false);
        console.warn("Failed to request autologin");
      });
    }, []);

    
    const ShortTextAnswer = getAnswerComponentBuilder("short-text-answer");
    const LongTextAnswer = getAnswerComponentBuilder("long-text-answer");
    const NumericAnswer = getAnswerComponentBuilder("numeric-answer");
    const TrueFalseAnswer = getAnswerComponentBuilder("truefalse-answer");  
    const SingleSelectAnswer = getAnswerComponentBuilder("single-select-answer");
    const MultiSelectAnswer = getAnswerComponentBuilder("multi-select-answer");

    const selectOptions = [
      {
        "id": "1",
        "value": "Forms"
      },
      {
        "id": "2",
        "value": "Surveys"
      },
      {
        "id": "3",
        "value": "Quizzes"
      },
      {
        "id": "4",
        "value": "Tests"
      },
      {
        "id": "5",
        "value": "Polls"
      }
    ];

    const items = [
      { content: <ShortTextAnswer questionNo={1} question={"Short text question"} componentType='' componentId='' /> },
      { content: <LongTextAnswer questionNo={2} question={"Long text question"} componentType='' componentId='' /> },
      { content: <MultiSelectAnswer questionNo={6} question={"Multi select"} options={selectOptions} componentType='' componentId='' /> },
      { content: <NumericAnswer questionNo={3} question={"Numeric answer"} componentType='' componentId='' /> },
      { content: <TrueFalseAnswer questionNo={4} question={"True/False question"} componentType='' componentId='' /> },
      { content: <SingleSelectAnswer questionNo={5} question={"Single select"} options={selectOptions} componentType='' componentId='' /> },
    ];

  return (
    <>
      <header className='row homeHeader'>
        <img src='logo.svg' height={42}></img>
        <div className='row'>
          {
            (isLogged) ? (
              <PrimaryButton onClick={() => navigate('/dash')}>
                <LayoutDashboard/>
                Dashboard
              </PrimaryButton>
            ) : (
              <>
                <SecondaryButton onClick={() => navigate("/login")}>Login</SecondaryButton>
                <PrimaryButton onClick={() => navigate("/register")}>
                  <UserPlus/>
                  Create account
                </PrimaryButton>
              </>
            )
          }
        </div>
      </header>
      <div className='squaresBgContainer'>
        <Squares 
          speed={0.25} 
          squareSize={40}
          direction='diagonal'
          borderColor='#f2eedd'
          hoverFillColor='#f2eedd'
        />
      </div>
      <main className='homeContainer'>
        <div className='headerSection'>
          <div className='bg-glow' id='bg-glow-1'></div>
          <img src='formly-hollow.png' alt='Formly'/>
          <h2 className='headingText'>
            Create powerful
            <RotatingText
              texts={['forms', 'quizzes', 'tests', 'surveys', 'polls']}
              mainClassName="headerRotatingText"
              staggerFrom={"last"}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-120%" }}
              staggerDuration={0.03}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              rotationInterval={2500}
            />
          </h2>
          <PrimaryButton onClick={() => navigate('/register')}>
            <ArrowRight/>
            Get started
          </PrimaryButton>
        </div>
        <div className='sectionSeparator'></div>
        <div className='builderSection'>
          <div className='builderComponents'>
            <div className='bg-glow' id='bg-glow-2'></div>
            <InfiniteScroll
              items={items}
              isTilted={true}
              tiltDirection='left'
              autoplay={true}
              autoplaySpeed={0.15}
              autoplayDirection="down"
              pauseOnHover={false}
              maxHeight='100%'
            />
          </div>
          <div className='builderComponentsInfo'>
            <div className='builderComponentsSections'>
              <p className='section-info'>
                <p className='headingBlockText'>Build</p> 
                Design forms using <span>highly flexible components</span>.&nbsp;
                Customize logic and scoring to match your exact needs.&nbsp; 
                <span>Restrict access</span> to selected individuals or respondent groups. 
                Speed up grading with <span>auto-evaluation</span> and customizable <span>grading schemas</span>.
              </p>
            </div>
            <img src='arrow1.svg' id='arrow1'></img>
          </div>
        </div>
      </main>
    </>
  )
}

