import { Component, ElementRef, ViewChild } from '@angular/core';
import { ChatCompletionRequestMessageRoleEnum } from 'openai';
import { OpenaiService } from 'src/app/services/openai.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  @ViewChild('messagesDiv', { static: false }) private messagesContainer: ElementRef | undefined;
  public messages: { role: ChatCompletionRequestMessageRoleEnum; content: string; tooltip: string }[] = [];
  public userMessage: string = '';
  public ChatCompletionRequestMessageRoleEnum = ChatCompletionRequestMessageRoleEnum;

  constructor(private openaiService: OpenaiService) {
   }

  ngOnInit(): void {
  }

  sendMessage(): void {
    const newUserMessage = { role: ChatCompletionRequestMessageRoleEnum.User, content: this.userMessage, tooltip: '' };
    this.messages.push(newUserMessage);
    this.scrollMessagesToBottom();

    // this.messages.push({ role: 'assistant', content: "l'utilisateur veux apprendre l'espagnol en discutant avec l'assistant (en pratiquant). Le but est que l'utilisateur parle en espagnol et que l'assistant réponde en espagnol. A chacune des phrases de l'utilisateur, l'assistant répond par un json qui prend 5 champs : answer (qui constitue la réponse directe à la phrase de l'utilisateur, comme si une personne epagnol locale répondait), traduction (qui constitue la traduction en francais du champ answer), correctionNaturalLanguage (qui explique en détail en Français les fautes de l'utilisateur, ou des meilleures formulation de synthaxe concernant la dernière phrase de l'utilisateur, en expliquant à l'utilisateur ce qu'elles veulent dire), un champ correctionBoolean (qui prend la valeur 1 si  le champ 'correction' contient des erreurs, et 0 sinon) et un champ nextAnswer (qui contient un exemple de réponse au champ 'answer', en expliquant en francais ce que ca veut dire)", tooltip: false });

    // Correct my sentence
    const askOpenAiForCorrection = "Correct this to standard Spanish : " + this.userMessage + '.\n\n';
    this.openaiService.fixSentence(askOpenAiForCorrection).subscribe(fixedSentence => {
      // Corrected Boolean
      const askOpenAiForBoolean = "Answer True if the sentence '" + this.userMessage + "' was correct, False if it needed correction by the assistant";
      const input2 = [
        {"role": ChatCompletionRequestMessageRoleEnum.User, "content": askOpenAiForCorrection},
        {"role": ChatCompletionRequestMessageRoleEnum.Assistant, "content": fixedSentence},
        {"role": ChatCompletionRequestMessageRoleEnum.User, "content": askOpenAiForBoolean},
      ];
      this.openaiService.getDirectMessageFromOpenAI(input2).subscribe((boolean: string) => {
        const emoji = boolean?.toLocaleLowerCase().includes('true') ? '✔️' : '❌';
        newUserMessage.tooltip = emoji + ' ' + fixedSentence;
        this.scrollMessagesToBottom();
      })
    });

    
    const messagesInput = this.messages.map(message => ({ role: message.role, content: message.content }));
    messagesInput.unshift({"role": ChatCompletionRequestMessageRoleEnum.System, "content": "Eres un local de España que se llama Juan Carlos. El usuario te habla en español y tú respondes en español. No entiendes otros idiomas que no sean el español. Retomas la conversación hablando de temas relacionados con la cultura española. El asistente a veces utiliza emojis."});
    this.openaiService.getDirectMessageFromOpenAI(messagesInput).subscribe(message => {
      this.messages.push({ role: ChatCompletionRequestMessageRoleEnum.Assistant, content: message, tooltip: '' });
      this.scrollMessagesToBottom();
    });
      
    // this.userMessage += ". (Répond en espagnol avec la traduction francaise entre paranthèses)";
    /*
    this.openaiService.getDataFromOpenAI(this.messages.map(message => ({ role: message.role, content: message.content }))).subscribe(message => {
      this.messages.push({ role: ChatCompletionRequestMessageRoleEnum.Assistant, content: message, tooltip: false });
    });
    */
  }

  scrollMessagesToBottom(): void {
    try {
      setTimeout(() => {
        if (this.messagesContainer) {
          this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
        }
      });
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }
}
