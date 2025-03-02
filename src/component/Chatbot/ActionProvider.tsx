
class ActionProvider {
  createChatBotMessage: any;
  setStateFunc: any;

  constructor(createChatBotMessage: any, setStateFunc: any) {
    this.createChatBotMessage = createChatBotMessage;
    this.setStateFunc = setStateFunc;
  }

  greet() {
    const greetingMessage = this.createChatBotMessage('Hello! How can I help you today?');
    this.updateChatbotState(greetingMessage);
  }

  handleLocation() {
    const locationMessage = this.createChatBotMessage('We are located at 123 Pharma Street, Cairo, Egypt.');
    this.updateChatbotState(locationMessage);
  }

  handleContact() {
    const contactMessage = this.createChatBotMessage('You can call us at +20 123 456 7890 or email us at info@smartpharmanet.com.');
    this.updateChatbotState(contactMessage);
  }

  handleDefault() {
    const defaultMessage = this.createChatBotMessage("I'm sorry, I didn't understand that. Can you please rephrase?");
    this.updateChatbotState(defaultMessage);
  }

  updateChatbotState(message: any) {
    this.setStateFunc((prevState: any) => ({
      ...prevState,
      messages: [...prevState.messages, message],
    }));
  }
}

export default ActionProvider;