import React, {Component} from 'react'
import {View, Animated, PanResponder, Dimensions, LayoutAnimation, UIManager} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHHOLD = SCREEN_WIDTH * 0.25;
const SWIPE_OUT_DURATION = 250;

class Deck extends Component {

  static defaultProps = {
    onSwipeRight: () => {},
    onSwipeLeft: () => {}
  };

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
      onPanResponderRelease: (event, gesture) => {
        if(gesture.dx > SWIPE_THRESHHOLD) {
          this.forceSwipe('right')
        } else if (gesture.dx < -SWIPE_THRESHHOLD) {
          this.forceSwipe('left')
        } else {
          this.resetPosition();
        }
      }
    });

    //both of these exist outside of the state but we declare them here anyway
    this.state = { panResponder, position, index: 0 };
  }

  resetPosition() {
    Animated.spring(this.state.position, {
      toValue: { x: 0, y: 0}
    }).start();
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.data !== this.props.data) {
      this.setState({index: 0})
    }
  }

  componentWillUpdate() {
    //animate any changes made to the component when it updates
    UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
    LayoutAnimation.spring();
  }

  forceSwipe(direction) {
    const x = direction === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH;
    Animated.timing(this.state.position, {
      toValue: { x, y: 0},
      duration: SWIPE_OUT_DURATION
    }).start(() => this.onSwipeComplete(direction));
  }

  onSwipeComplete(direction) {
    const {onSwipeLeft, onSwipeRight, data} = this.props;
    const item = data[this.state.index];
    direction === 'right' ? onSwipeRight(item) : onSwipeLeft(item);
    this.state.position.setValue({x: 0, y: 0});
    this.setState({index: this.state.index + 1})
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
    if(this.state.index >= this.props.data.length) {
      return this.props.renderNoMoreCards();
    }

    return this.props.data.map((item, i) => {
      if(i < this.state.index) {
        return null;
      }

      if(i === this.state.index) {
        return (
          //reference position object, get current layout, pass to animated view whenever layout changes, pass to animated view
          <Animated.View style={[this.getCardStyle(),
            styles.cardStyle]} {...this.state.panResponder.panHandlers} key={item.id}>
            {this.props.renderCard(item)}
          </Animated.View>
        )
      }
      return (
        <Animated.View key={item.id} style={[styles.cardStyle, { top: 10 * (i-this.state.index) }]}>
          {this.props.renderCard(item)}
        </Animated.View>
      )
    }).reverse();
  }

  render() {
    return (
      <View style={styles.cardStyle}>
        {this.renderCards()}
      </View>
    )
  }
}

const styles = {
  cardStyle: {
    position: 'absolute',
    width: SCREEN_WIDTH
  }
};

export default Deck;