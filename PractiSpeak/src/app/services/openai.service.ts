import { Injectable } from '@angular/core';
import { ChatCompletionRequestMessageRoleEnum, Configuration, OpenAIApi } from 'openai';
import { Observable, filter, from, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { switchMap } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class OpenaiService {

  private openai: OpenAIApi;

  constructor() { 
    let configuration = new Configuration({
      organization:"org-n12gBkscmbYuoTyDuU1l4dfN",
      apiKey: "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",
    });
  
    delete configuration.baseOptions.headers['User-Agent'];
    
    this.openai = new OpenAIApi(configuration);
  }

  /*
  To put back on server
  readonly configuration = new Configuration({
    apiKey: environment.openai
  });
  readonly openai = new OpenAIApi(this.configuration);
  */

  public continueDiscussion(messages: { role: ChatCompletionRequestMessageRoleEnum; content: string}[]): Observable<any> {
    // const prompt: string = "l'utilisateur veux apprendre l'espagnol en discutant avec l'assistant (en pratiquant). Le but est que l'utilisateur parle en espagnol et que l'assistant réponde en espagnol. A chacune des phrases de l'utilisateur, l'assistant répond par un json qui prend 5 champs : answer (qui constitue la réponse directe à la phrase de l'utilisateur, comme si une personne epagnol locale répondait), traduction (qui constitue la traduction en francais du champ answer), correctionNaturalLanguage (qui explique en détail en Français les fautes de l'utilisateur, ou des meilleures formulation de synthaxe concernant la dernière phrase de l'utilisateur, en expliquant à l'utilisateur ce qu'elles veulent dire), un champ correctionBoolean (qui prend la valeur 1 si  le champ 'correction' contient des erreurs, et 0 sinon) et un champ nextAnswer (qui contient un exemple de réponse au champ 'answer', en expliquant en francais ce que ca veut dire)";
    // const prompt: string = "l'utilisateur veux apprendre l'espagnol en discutant avec l'assistant. Le but est que l'utilisateur parle en espagnol et que l'assistant réponde en espagnol, et ajoute à la fin de la réponse entre paranthèses en francais les fautes de l'utilisateur et/ou des exemples de meilleures formulations";
    // const prompt: string = "consigne : corriger les erreurs d'accents et de syntaxe phrase espagnol suivante : 'Hola, que tal ?'. Réponse :";

    // Ajout du system prompt
    // messages.unshift({"role": ChatCompletionRequestMessageRoleEnum.System, "content": "l'assistant corriger les erreurs d'accents et de syntaxe de l'utilisateur en le corrigeant en francais"})
    // messages.unshift({"role": ChatCompletionRequestMessageRoleEnum.Assistant, "content": "Sure, I’d be happy to help with that! To get started, could you provide the Spanish sentence or text that you would like me to correct? I’ll do my best to help with any grammar or spelling issues that I can identify. Please keep in mind that I am a large language model trained by OpenAI, so my knowledge is based on the text that has been fed into my training data. If there are any specific topics or areas that you would like me to focus on, let me know and I will do my best to assist."})
    // messages.unshift({"role": ChatCompletionRequestMessageRoleEnum.User, "content": "Can you correct my Spanish grammar and spelling?"})
    // messages.unshift({"role": ChatCompletionRequestMessageRoleEnum.System, "content": "l'assistant "})
    

    console.log('messages', messages)

    return from(this.openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      // model: "gpt-4",
      messages: messages,
      max_tokens: 256
    })).pipe(
      filter(resp => !!resp && !!resp.data),
      map(resp => resp.data),
      filter((data: any) => data.choices && data.choices.length > 0 && data.choices[0].message),
      map(data => data.choices[0].message.content)
    )
  }

  // USAGE

  

  public getDirectMessageFromOpenAI(messages: { role: ChatCompletionRequestMessageRoleEnum; content: string}[]): Observable<any> {
    return from(this.openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      // model: "gpt-4",
      messages: messages,
      max_tokens: 256,

    })).pipe(
      filter(resp => !!resp && !!resp.data),
      map(resp => resp.data),
      filter((data: any) => data.choices && data.choices.length > 0 && data.choices[0].message),
      map(data => data.choices[0].message.content)
    );
  }

  //DEPRECATED?TO DELETE

  public fixSentence(message: string): Observable<any> {
    return from(this.openai.createCompletion({
      model: "text-davinci-003",
      // model: "gpt-4",
      prompt: message,
      max_tokens: 256
    })).pipe(
      filter(resp => !!resp && !!resp.data),
      map(resp => resp.data),
      filter((data: any) => data.choices && data.choices.length > 0 && data.choices[0].text),
      map(data => data.choices[0].text)
    )
  }

  /*
  public getDataFromOpenAI3(message: string): Observable<any> {
    return from(this.openai.createEdit({
      model: "text-davinci-edit-001",
      input: message,
      instruction: "corriger les erreurs d'accents et de syntaxe"
    })).pipe(
      filter(resp => !!resp && !!resp.data),
      map(resp => resp.data),
      filter((data: any) => data.choices && data.choices.length > 0 && data.choices[0].text),
      map(data => data.choices[0].message.text)
    )
  }
  */

}
