import * as React from 'react';
import raf from 'raf';

import './index.css';

export interface TitleLetterSliderProps { 
  letters: string;
  animationDuration: number;
}

export interface TitleLetterSliderState {
  animating: boolean;
  currentLetters: string;
  nextLetters: string|null;
  queuedLetters: string|null;
}

const easeInCubic = ( t:number ): number => t * t * t;
const easeInOutCubic = ( t:number ) => t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1;
const easeInOutQuert = ( t:number ) => t<.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t;

export class TitleLetterSlider 
extends React.Component<TitleLetterSliderProps, TitleLetterSliderState> {

  public static defaultProps: Partial<TitleLetterSliderProps> = {
    animationDuration: 700,
    letters: ''
  };

  state = {
    animating: false,
    currentLetters: this.props.letters,
    nextLetters: null,
    queuedLetters: null
  };

  rootRef: HTMLDivElement;

  componentWillReceiveProps(nextProps: TitleLetterSliderProps) {
    // if animation is still processing next letters, keep a reference of the
    // aniamtion that should start after this one. Don't animate now.
    if ( this.state.nextLetters ) {
      return this.setState({
        queuedLetters: nextProps.letters
      });
    }

    this.startStateTransitionForAnimation(nextProps.letters);
  }

  setSelfRef = (el: HTMLDivElement): void => {
    this.rootRef = el;
  }

  startStateTransitionForAnimation = async (nextLetters: string|null) => {
    // console.log('set next letters', nextLetters)
    await this.setStateWithPromise({nextLetters: nextLetters});
    // console.log('sleep 10 ms')
    await this.sleep(10); // raf here 
    


    const endEvent = this.oneTransitionEnd(
      this.rootRef.querySelector('.title-letter-slider__next-letters > span:last-child'),
      1000
    );
    
    const aniamtionStarted = this.setStateWithPromise({animating: true});    
    
    await Promise.all([endEvent, aniamtionStarted])

    // console.log('check if queue is null or not')
    // if ( this.state.queuedLetters !== null ) {
    //   const newLetters: string|null = this.state.queuedLetters;
    //   await this.setStateWithPromise({
    //     queuedLetters: null,
    //     nextLetters,
    //     currentLetters: nextLetters || ''
    //   });
    //   await this.startStateTransitionForAnimation(newLetters);
    //   await this.setStateWithPromise({animating: false});
    //   return;
    // }

    await this.setStateWithPromise({
      nextLetters: null,
      queuedLetters: null,
      currentLetters: nextLetters || '',
      animating: false
    });

    

    await this.setStateWithPromise({animating: false});
  }

  renderLetter = (letter: string, index: number, items: Array<{}>) => {
    const { animating } = this.state;
    const extras: {style: object} = { style: {
      display: 'inline-block'
    } };
      
    if ( animating ) {
      extras.style = {
        ...extras.style,
        transform: 'translateY(-100%)',
        transitionTimingFunction: 'cubic-bezier(0.8,0,0.2,1)',
        transitionDuration: `${this.props.animationDuration}ms`,
        transitionDelay: `${index * 30 + 200}ms`
      };
    }

    return <span {...extras} key={`${letter}-${index}`}>{letter}</span>;
    
  }
  
  render () {

    const letters = this.state.currentLetters.split('');
    const nextLetters = (this.state.nextLetters || '').split('');
  
    return (
      <div 
        className='title-letter-slider' 
        ref={this.setSelfRef}
      >
        <span 
          className='title-letter-slider__current-letters'
        >
          {letters.map(this.renderLetter)}        
        </span>

        <span 
          className='title-letter-slider__next-letters'
        >
          {nextLetters.map(this.renderLetter)}
        </span>

      </div>
    );
  }
  
  private setStateWithPromise = (stateObject: object): Promise<undefined> => {
    return new Promise((resolve) => {
      raf(() => {
        this.setState(stateObject, () => { resolve(); });      
      });
    });
  }

  private sleep = (delay: number): Promise<undefined> => {
    return new Promise((resolve) => {
      setTimeout(resolve, delay);
    });
  }

  private oneTransitionEnd = (node: Element|null, maxWait: number = 1000): Promise<undefined> => {
    if ( !node ) {
      return Promise.resolve(undefined)
    }

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        node.removeEventListener('transitionend', handler);
        resolve();
      }, maxWait)
      const handler = () => {
        // console.log('transitionend', node);
        clearTimeout(timeout)
        resolve();
        node.removeEventListener('transitionend', handler);
      };
      
      node.addEventListener('transitionend', handler);
    });
  }
}