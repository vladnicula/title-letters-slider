import * as React from 'react';
import raf from 'raf';

import './index.css';

export enum AnimationDirection {
  UP = 1,
  DOWN
}

export interface TitleLetterSliderProps { 
  letters: string;
  animationDuration?: number;
  animationDirection?: AnimationDirection;
  // animate even if received value is identical to current one?
  aniamteToIdenticalValues?: Boolean;
}

export interface TitleLetterSliderState {
  // are we in a animation state, or not? All other state vars below are
  // relevant only during the animation state.
  animating: boolean;

  // the current letters in the current animation
  currentLetters: string;

  // the next letters in the current animation
  nextLetters: string|null;

  // if we receive new letters while we are still aniamting
  queuedLetters: string|null;

  // the current animation direction for the component.
  animationDirection: AnimationDirection;

  // if there are queued letters that will run after the current animation
  // ends, store the direction of the next animation here.
  queuedDirection: AnimationDirection|null;
}

// const easeInCubic = ( t:number ): number => t * t * t;
// const easeInOutCubic = ( t:number ) => t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1;
// const easeInOutQuert = ( t:number ) => t<.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t;

export class TitleLetterSlider 
extends React.Component<TitleLetterSliderProps, TitleLetterSliderState> {

  public static ANIMATION_DIRECTIONS = AnimationDirection;

  public static defaultProps: Partial<TitleLetterSliderProps> = {
    animationDuration: 700,
    animationDirection: AnimationDirection.UP,
    letters: '',
    aniamteToIdenticalValues: true
  }

  state = {
    animating: false,
    currentLetters: this.props.letters,
    nextLetters: null,
    queuedLetters: null,
    animationDirection: this.props.animationDirection || AnimationDirection.UP,
    queuedDirection: null
  }

  rootRef: HTMLDivElement

  public componentWillReceiveProps(nextProps: TitleLetterSliderProps) {
    // if animation is still processing next letters, keep a reference of the
    // aniamtion that should start after this one. Don't animate now.
    const { 
      letters, 
      animationDirection = AnimationDirection.UP 
    } = nextProps

    if ( !this.props.aniamteToIdenticalValues && letters === this.props.letters ) {
      return;
    }

    if ( this.state.animating ) {
      if ( !this.props.aniamteToIdenticalValues && letters === this.state.nextLetters ) {
        return this.setState({
          queuedLetters: null,
          queuedDirection: null
        })
      }
      return this.setState({
        queuedLetters: letters,
        queuedDirection: animationDirection
      })
    }

    this.startStateTransitionForAnimation(letters, animationDirection)
  }

  private setSelfRef = (el: HTMLDivElement): void => {
    this.rootRef = el
  }

  private startStateTransitionForAnimation = async (
    nextLetters: string,
    animationDirection: AnimationDirection
  ) => {

    await this.setStateWithPromise({
      animationDirection: animationDirection,
      nextLetters: nextLetters
    })
    
    const endEvent = this.oneTransitionEnd(
      this.rootRef.querySelector(
        '.title-letter-slider__next-letters > span:last-child'
      ),
      1000
    )
    
    const aniamtionStarted = this.setStateWithPromise({animating: true})  
    
    await Promise.all([endEvent, aniamtionStarted])

    const { queuedLetters, queuedDirection } = this.state

    await this.setStateWithPromise({
      nextLetters: null,
      queuedLetters: null,
      currentLetters: nextLetters || '',
      animating: false
    })

    if ( queuedLetters ) {
      this.startStateTransitionForAnimation(
        queuedLetters,
        queuedDirection || AnimationDirection.UP
      )
    }
  }

  private renderLetter = (letter: string, index: number, items: Array<{}>) => {
    const { animating, animationDirection } = this.state

    const style = {}
      
    if ( animating ) {
      Object.assign(style, {
        transform: animationDirection === AnimationDirection.UP 
          ? 'translateY(-100%)' 
          : 'translateY(100%)',
        transitionTimingFunction: 'cubic-bezier(0.8,0,0.2,1)',
        transitionDuration: `${this.props.animationDuration}ms`,
        transitionDelay: `${index * 30 + 200}ms`
      })
    }

    return <span style={style} key={`${letter}-${index}`}>{letter}</span>
    
  }

  private getNextLettersStyles (props: TitleLetterSliderState) {
    const { animationDirection } = props
    return {
      transform: animationDirection === AnimationDirection.UP 
        ? `translateY(100%)`
        : `translateY(-100%)`
    }
  }
  
  public render () {

    const letters = Array.from(this.state.currentLetters)
    const nextLetters = Array.from((this.state.nextLetters || ''))
  
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
          style={this.getNextLettersStyles(this.state)}
        >
          {nextLetters.map(this.renderLetter)}
        </span>

      </div>
    )
  }
  
  private setStateWithPromise = (stateObject: object): Promise<undefined> => {
    return new Promise((resolve) => {
      raf(() => {
        this.setState(stateObject, () => { resolve() })      
      })
    })
  }

  private oneTransitionEnd = (node: Element|null, maxWait: number = 1000): Promise<undefined> => {
    if ( !node ) {
      return Promise.resolve(undefined)
    }

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        node.removeEventListener('transitionend', handler)
        resolve()
      }, maxWait)
      const handler = () => {
        clearTimeout(timeout)
        resolve()
        node.removeEventListener('transitionend', handler)
      }
      
      node.addEventListener('transitionend', handler)
    })
  }
}