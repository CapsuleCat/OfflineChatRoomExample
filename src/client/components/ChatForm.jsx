ChatForm = React.createClass({
  getDefaultProps() {
    return {
      hasOpenConnection: false
    };
  },

  handleSubmit(e) {
    e.preventDefault();

    MessageStore.post(this.refs.text.value);

    this.refs.text.value = '';
  },

  render() {
    if (! this.props.hasOpenConnection) {
      return <div></div>;
    }

    return (
      <form onSubmit={this.handleSubmit}>
        <div className="form-group">
          <input className="form-control" ref="text" type="text" />
        </div>
      </form>
    );
  }
});