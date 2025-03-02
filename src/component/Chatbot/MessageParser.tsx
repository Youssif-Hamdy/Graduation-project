class MessageParser {
  actionProvider: any;

  constructor(actionProvider: any) {
    this.actionProvider = actionProvider;
  }

  parse(message: string) {
    const lowerCaseMessage = message.toLowerCase();

    if (lowerCaseMessage.includes('hello')) {
      this.actionProvider.greet();
    } else if (lowerCaseMessage.includes('location')) {
      this.actionProvider.handleLocation();
    } else if (lowerCaseMessage.includes('contact')) {
      this.actionProvider.handleContact();
    } else {
      this.actionProvider.handleDefault();
    }
  }
}

export default MessageParser;