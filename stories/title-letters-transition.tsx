import * as React from 'react';

import { storiesOf } from '@storybook/react';

import { TitleLetterSlider } from '../src/components/title-letter-slider';

storiesOf('TitleLetterSlider', module)
  .add('hello wolrd', () => <TitleLetterSlider letters="hello world"/>)
  .add('trigger', () => {
    const values = [
      'hiking', 'lakes', 'rivers', 'paths', 'emo\🕵️‍'
    ];

    const ReactComponent = class Demo extends React.Component {
      titleSlider: TitleLetterSlider;

      state = {
        index: 0
      };

      navigate = () => {
        const { index } = this.state; 
        this.setState({
          index: index === values.length - 1 ? 0 : index + 1
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
          />
          <button onClick={this.navigate}>Navigate</button>
          (should show {values[this.state.index]})
          </div>
        );
      }
    }; 
    return <ReactComponent/>;
  });