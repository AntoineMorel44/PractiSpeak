import { Injectable } from '@angular/core';
import { ChatCompletionRequestMessageRoleEnum, Configuration, OpenAIApi } from 'openai';
import { Observable, filter, from, map } from 'rxjs';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class OpenaiService {

  private apiUrl = 'https://6ijh5ou2qc.execute-api.eu-north-1.amazonaws.com/Preprod/chat';

  constructor(private http: HttpClient) { 
  }

  public continueDiscussion(messages: { role: ChatCompletionRequestMessageRoleEnum; content: string; tooltip: string}[]): Observable<any> {

      const transformedMessages: { role: ChatCompletionRequestMessageRoleEnum; content: string;}[] = 
      messages.map(message => ({
          role: message.role,
          content: message.content
      }));


    console.log('messages', messages)


    const body = {
      messages: transformedMessages
    };

    return this.http.post(this.apiUrl, body);

  }
}
