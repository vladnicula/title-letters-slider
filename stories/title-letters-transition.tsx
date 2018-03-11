import * as React from 'react';

import { storiesOf } from '@storybook/react';

import { TitleLetterSlider } from '../src/components/title-letter-slider';

storiesOf('TitleLetterSlider', module)
  .add('hello wolrd', () => <TitleLetterSlider letters="hello world"/>)
  .add('trigger', () => {
    const values = [
      'hiking', 'lakes', 'rivers', 'paths', 'emo‍', 'walking'
    ];

    const ReactComponent = class Demo extends React.Component {
      titleSlider: TitleLetterSlider;

      state = {
        index: 0,
        direction: TitleLetterSlider.ANIMATION_DIRECTIONS.UP
      };

      next = () => {
        const { index } = this.state; 
        this.setState({
          index: index === values.length - 1 ? 0 : index + 1,
          direction: TitleLetterSlider.ANIMATION_DIRECTIONS.UP
        });
      }

      back = () => {
        const { index } = this.state; 
        
        this.setState({
          index: index === 0 ? values.length - 1 : index - 1,
          direction: TitleLetterSlider.ANIMATION_DIRECTIONS.DOWN
        });
      }

      setRef = (el: TitleLetterSlider) => {
        this.titleSlider = el;
      }

      render () {
        return (
          <div>
          <TitleLetterSlider
            ref={this.setRef}
            letters={values[this.state.index]}
            animationDirection={this.state.direction}
          />
          <button onClick={this.back}>Back</button>
          <button onClick={this.next}>Next</button>
          (should show {values[this.state.index]})
          </div>
        );
      }
    }; 
    return <ReactComponent/>;
  })
  .add('same value animation', () => {
    const values = [
      'lakes', 'lakes', 'lakes', 'rivers', 'rivers', 'rivers'
    ];

    const ReactComponent = class Demo extends React.Component {
      titleSlider: TitleLetterSlider;

      state = {
        index: 0,
        direction: TitleLetterSlider.ANIMATION_DIRECTIONS.UP,
        animateOn: true
      };

      next = () => {
        const { index } = this.state; 
        this.setState({
          index: index === values.length - 1 ? 0 : index + 1,
          direction: TitleLetterSlider.ANIMATION_DIRECTIONS.UP
        });
      }

      back = () => {
        const { index } = this.state; 
        
        this.setState({
          index: index === 0 ? values.length - 1 : index - 1,
          direction: TitleLetterSlider.ANIMATION_DIRECTIONS.DOWN
        });
      }

      toggleIdentical = () => {
        this.setState({
          animateOn: !this.state.animateOn
        })
      }

      setRef = (el: TitleLetterSlider) => {
        this.titleSlider = el;
      }

      render () {
        return (
          <div>
          <TitleLetterSlider
            ref={this.setRef}
            letters={values[this.state.index]}
            animationDirection={this.state.direction}
            aniamteToIdenticalValues={this.state.animateOn}
          />
          <button onClick={this.back}>Back</button>
          <button onClick={this.next}>Next</button>
          <button onClick={this.toggleIdentical}>
            Animate identical {new String(this.state.animateOn)}
          </button>

          <div>(should show values[{this.state.index}] = {values[this.state.index]})</div>
          </div>
        );
      }
    }; 
    return <ReactComponent/>;
  });