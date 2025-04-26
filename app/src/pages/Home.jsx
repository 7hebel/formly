import Squares from '../blocks/Backgrounds/Squares.jsx';
import RotatingText from '../blocks/TextAnimations/RotatingText.jsx';
import InfiniteScroll from '../blocks/Components/InfiniteScroll.jsx';
import ClickSpark from '../blocks/Components/ClickSpark.jsx';
import Magnet from '../blocks/Components/Magnet.jsx';
import { SchemaEditor } from '../components/GradingSchemas.jsx';
import { PrimaryButton, SecondaryButton, TertiaryButton } from '../ui/Button.jsx';
import { UserPlus, LayoutDashboard, ArrowRight, MousePointerClick } from 'lucide-react';
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

  const exampleSchema = {
    schema_id: "example",
    title: "Example grading schema",
    steps: [20, 40, 60, 80],
    grades: ["1", "2", "3", "4", "5"],
  }


  return (
    <ClickSpark sparkColor="#fc0">
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
            <div id='interactive1'>
              <Magnet padding={300} disabled={false} magnetStrength={40}>
                <div className='interactiveBadge'>
                  <MousePointerClick/>Interactive
                </div>
              </Magnet>
            </div>
            <img src='build-hollow.svg' className='sectionBgImg'></img>
            <div className='bg-glow' id='bg-glow-2'></div>
            <InfiniteScroll
              items={items}
              isTilted={true}
              tiltDirection='left'
              autoplay={true}
              autoplaySpeed={0.2}
              autoplayDirection="down"
              pauseOnHover={false}
              maxHeight='100%'
            />
          </div>
          <div className='builderComponentsInfo'>
            <div className='builderComponentsSections'>
              <div className='section-info' style={{ rotate: "2deg" }}>
                <h4 className='headingBlockText'>Build</h4> 
                Design forms using <span>flexible components</span>.&nbsp;
                Customize logic and scoring to match your exact needs.&nbsp; 
                <span>Restrict access</span> to selected individuals or respondent lists. 
                Speed up grading with <span>auto-evaluation</span> and customizable <span>grading schemas</span>.
              </div>
            </div>
            <img src='arrow1.svg' id='arrow1'></img>
          </div>
        </div>
        <div className='sectionSeparator'></div>
        <div className='builderSection builderSectionRev'>
          <div className='builderComponentsInfo'>
            <div className='builderComponentsSections'>
              <div className='section-info' style={{ rotate: "-2deg" }}>
                <h4 className='headingBlockText'>Lists</h4> 
                Create and manage <span>custom respondent lists</span>. 
                Easily add or remove emails to stay organized. 
                <span>Assign forms</span> directly to specific groups for faster distribution.
              </div>
            </div>
            <img src='arrow2.svg' id='arrow2'></img>
          </div>
          <div className='builderComponents' id='listsShowcase'>
            <div className='bg-glow' id='bg-glow-3'></div>
            <Magnet padding={300} disabled={false} magnetStrength={70}>
              <img src='list-mock.png' id='list-mock'></img>
            </Magnet>
          </div>
        </div>
        <div className='sectionSeparator'></div>
        <div className='builderSection'>
          <div className='bg-glow' id='bg-glow-4'></div>
          <div id='interactive2'>
            <Magnet padding={300} disabled={false} magnetStrength={40}>
              <div className='interactiveBadge'>
                <MousePointerClick/>Interactive
              </div>
            </Magnet>
          </div>
          <div className='builderComponents' id='gradingSchemasShowcase'>
            <SchemaEditor schema={exampleSchema} noSave={true}></SchemaEditor>
          </div>
          <div className='builderComponentsInfo'>
            <div className='builderComponentsSections'>
              <div className='section-info' style={{ rotate: "2deg" }}>
                <h4 className='headingBlockText'>Grading schemas</h4> 
                Create <span>custom grading schemas</span> to fit your forms. 
                Define scoring steps and assign grades with ease. 
                <span>Link schemas</span> to forms for consistent grading.
              </div>
            </div>
            <img src='arrow3.svg' id='arrow3'></img>
          </div>
        </div>
        <div className='sectionSeparator'></div>
        <footer>
          <div className='footerContent'>
            <img src='formly-3d.png' id='bottom-logo'/>
            <PrimaryButton onClick={() => navigate('/register')}>
              <ArrowRight/>
              Get started
            </PrimaryButton>
          </div>

          
        </footer>
      </main>
    </ClickSpark>
  )
}

