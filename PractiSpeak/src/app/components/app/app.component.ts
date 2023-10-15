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
    this.messages.push({ role: 'system', content: "l'utilisateur veux apprendre l'espagnol en discutant avec l'assistant (en pratiquant). Le but est que l'utilisateur parle en espagnol et que l'assistant réponde en espagnol. A chacune des phrases de l'utilisateur, l'assistant répond par un json qui prend 5 champs : answer (qui constitue la réponse directe à la phrase de l'utilisateur, comme si une personne epagnol locale répondait), traduction (qui constitue la traduction en francais du champ answer), correctionNaturalLanguage (qui explique en détail en Français les fautes de l'utilisateur, ou des meilleures formulation de synthaxe concernant la dernière phrase de l'utilisateur, en expliquant à l'utilisateur ce qu'elles veulent dire), un champ correctionBoolean (qui prend la valeur 1 si  le champ 'correction' contient des erreurs, et 0 sinon) et un champ nextAnswer (qui contient un exemple de réponse au champ 'answer', en expliquant en francais ce que ca veut dire)", tooltip: '' });

  }

  sendMessage(): void {
    const newUserMessage = { role: ChatCompletionRequestMessageRoleEnum.User, content: this.userMessage, tooltip: '' };
    this.messages.push(newUserMessage);
    this.scrollMessagesToBottom();

    this.openaiService.continueDiscussion(this.messages).subscribe(response => {
      console.log('having response', response);
      let jsonObject: any;

      try {
          jsonObject = JSON.parse(response);
          console.log(jsonObject);
      } catch (error) {
          console.error("Error parsing JSON string:", error);
      }

      const emoji = jsonObject.correctionBoolean === "1" ? '❌' : '✔️';
      newUserMessage.tooltip = emoji + ' ' + jsonObject.correctionNaturalLanguage;

      this.messages.push({ role: ChatCompletionRequestMessageRoleEnum.Assistant, content: jsonObject.answer, tooltip: jsonObject.traduction });
      this.scrollMessagesToBottom();
    })

    
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
