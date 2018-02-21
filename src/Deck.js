import React, {Component} from 'react'
import {View, Animated, PanResponder, Dimensions} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;

class Deck extends Component {

  constructor(props) {
    super(props);

    const position = new Animated.ValueXY();

    const panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      //callback called whenever user tries to drag around the screen
      onPanResponderMove: (event, gesture) => {
        //take the value and update the current position
        position.setValue({
          x: gesture.dx,
          y: gesture.dy
        })
      },
      //called any time a user lets go
      onPanResponderRelease: () => {
        this.resetPosition();
      }
    });

    //both of these exist outside of the state but we declare them here anyway
    this.state = { panResponder, position };
  }

  resetPosition() {
    Animated.spring(this.state.position, {
      toValue: { x: 0, y: 0}
    }).start();
  }

  getCardStyle() {
    //set up interpolation

    const { position } = this.state;
    const rotate = position.x.interpolate({
      //if you drag 500 units to the left, rotate negative 120 deg etc
      inputRange: [-SCREEN_WIDTH * 2, 0, SCREEN_WIDTH * 2],
      outputRange: ['-120deg','0deg','120deg']
    });

    //get layout returns an object that has information about how the card should be positiioned.
    //take all properties out of getLayout and add another custom one (transform)
    return {
      ...position.getLayout(),
      transform: [{rotate}]
    }
  }

  renderCards() {
    return this.props.data.map((item, index) => {
      if(index === 0) {
        return (
          //reference position object, get current layout, pass to animated view whenever layout changes, pass to animated view
          <Animated.View style={this.state.position.getLayout()} {...this.state.panResponder.panHandlers} key={item.id} style={this.getCardStyle()}>
            {this.props.renderCard(item)}
          </Animated.View>
        )
      }
      return this.props.renderCard(item);
    });
  }

  render() {
    return (
      <View>
        {this.renderCards()}
      </View>
    )
  }
}

export default Deck;