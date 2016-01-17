ChatMessage = React.createClass({
  render() {
    var styles = {
      'float': (this.props.poster === 'me' ? 'right' : 'left')
    };

    var classNames = 'alert ';

    classNames += (this.props.poster === 'me' ? 'alert-info' : 'alert-success');

    return (
      <div>
        <div style={styles} className={classNames}>
          <p>{this.props.text}</p>
        </div>
        <div style={{clear: 'both'}}></div>
      </div>
    );
  }
});