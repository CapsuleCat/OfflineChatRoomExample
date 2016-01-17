ChatForm = React.createClass({
  handleSubmit(e) {
    e.preventDefault();

    MessageStore.post(this.refs.text.value);

    this.refs.text.value = '';
  },

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <input ref="text" type="text" />
      </form>
    );
  }
});