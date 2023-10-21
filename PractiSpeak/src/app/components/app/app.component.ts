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
  public technicalMessages: { role: ChatCompletionRequestMessageRoleEnum; content: string; tooltip: string; translated?: boolean }[] = [];
  public interfaceMessages: { role: ChatCompletionRequestMessageRoleEnum; content: string; tooltip: string; translated?: boolean }[] = [];
  public userMessage: string = '';
  public ChatCompletionRequestMessageRoleEnum = ChatCompletionRequestMessageRoleEnum;
  public language: string = '';
  public showLanguagePanel: boolean = true;
  public loading: boolean = false;
  public error: boolean = false;

  constructor(private openaiService: OpenaiService) {
   }

  ngOnInit(): void {
  }

  validateLanague() {
    if (this.language.length > 1) {
      this.technicalMessages.push({ role: 'system', content: "Le but de l'assistant est de dicuter avec l'utilisateur autour de la culture, l'art, l'histoire du pays associé à " + this.language + ". Par exemple, si l'utilisateur te demande comment tu vas, tu répond et tu enchaine par une annecdote sur la culture du pays, et tu essaye de l'encourager à parler avec toi. Ne pose pas des questions génériques comme 'qu'est ce que tu aimerai savoir' mais plutot des questions spécifiques ou des choix de topics de discussion. Le but est que l'utilisateur parle en " + this.language + " et que l'assistant réponde en " + this.language + ". A chacune des phrases de l'utilisateur, l'assistant répond par un json qui prend 5 champs : answer (qui constitue la réponse directe à la phrase de l'utilisateur, comme si une personne " + this.language + " locale répondait), traduction (qui constitue la traduction en francais du champ answer), correctionNaturalLanguage (qui explique en détail en Français les fautes de l'utilisateur, ou des meilleures formulation de synthaxe concernant la dernière phrase de l'utilisateur, en expliquant à l'utilisateur ce qu'elles veulent dire), un champ correctionBoolean (qui prend la valeur 1 si  le champ 'correction' contient des erreurs, et 0 sinon). A n'IMPORTE QUEL MOMENT de la discussion, si la réponse n'est pas au format JSON { answer: ..., correctionBoolean: ..., correctionNaturalLanguage: ..., traduction: ... } elle est considérée comme INCORRECTE.", tooltip: '' });
      this.showLanguagePanel = false;
      this.userMessage = "👋";
      this.sendMessage();
    }
  }

  sendMessage(): void {
    const newUserMessage = { role: ChatCompletionRequestMessageRoleEnum.User, content: this.userMessage, tooltip: '' };
    this.interfaceMessages.push(newUserMessage);
    this.technicalMessages.push(newUserMessage);
    this.scrollMessagesToBottom();
    this.loading = true;
    this.error = false;
    this.userMessage = '';

    this.openaiService.continueDiscussion(this.technicalMessages).subscribe(response => {
      console.log('having response', response);
      this.loading = false;
      let jsonObject: any;

      try {
          jsonObject = JSON.parse(response.body);
          console.log(jsonObject);
      } catch (error) {
          this.error = true;
          console.error("Error parsing JSON string:", error);
      }

      const emoji = jsonObject.correctionBoolean === "1" ? '❌' : '✔️';
      newUserMessage.tooltip = emoji + ' ' + jsonObject.correctionNaturalLanguage;

      this.technicalMessages.push({ role: ChatCompletionRequestMessageRoleEnum.Assistant, content: response.body, tooltip: '' });
      this.interfaceMessages.push({ role: ChatCompletionRequestMessageRoleEnum.Assistant, content: jsonObject.answer, tooltip: jsonObject.traduction, translated: false });
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
