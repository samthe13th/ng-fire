import {Component, Input, Output, EventEmitter, forwardRef, ViewChild, ElementRef } from '@angular/core';
import * as _ from 'lodash';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import * as FaIcons from '@fortawesome/free-solid-svg-icons';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-inline-edit',
    template: `
    <div *ngIf="label !== ''" class="inline-label">{{label}}</div>
    <!-- CODE -->
    <div 
      *ngIf="type === 'textarea'"
      class="inline-edit">
        <ng-container *ngIf="readMode">
          <pre *ngIf="font === 'code'" (click)="enterEditMode('textarea')">
            <code>{{value}}</code>
          </pre>
          <button
            class="action-button grey xs"
            ngxClipboard
            [cbContent]="value"
            (cbOnSuccess)="onClipboardCopy($event)">
            <fa-icon [icon]="faIcons.faCopy"></fa-icon>
          </button>
        </ng-container>
        <div class="inline-input textarea" *ngIf="!readMode">
          <textarea
            #inlineTextarea
            [placeholder]="placeholder"
            [tabindex]="0"
            class="form-textarea"
            [(ngModel)]="tempValue">
          </textarea>
          <ng-container *ngTemplateOutlet="inlineEditButtons"></ng-container>
        </div>
    </div>

    <!-- INPUT -->
    <div class="inline-edit" [class.monospace]="monospace" *ngIf="type === 'input'">
      <div *ngIf="readMode" 
        class="inline-view-input"
        [class.code]="font === 'code'" 
        (click)="enterEditMode('input')">
        {{value ? value : placeholder }}
      </div>
      <div class="inline-input input" *ngIf="!readMode">
        <input #inlineInput type="text" [placeholder]="placeholder" class="form-input input-edit" [(ngModel)]="tempValue"/>
        <ng-container *ngTemplateOutlet="inlineEditButtons"></ng-container>
      </div>
      <button 
        *ngIf="copy"
        class="action-button grey xs"
        ngxClipboard
        [cbContent]="value"
        (cbOnSuccess)="onClipboardCopy($event)"
      >
      <fa-icon [icon]="faIcons.faCopy"></fa-icon>
      </button>
    </div>

    <ng-template #inlineEditButtons>
      <div class="inline-edit-buttons">
        <button class="inline-edit-button cancel" (click)="readMode = true">✕</button>
        <button class="inline-edit-button confirm" (click)="confirmEdit()">✓</button>
      </div>
    </ng-template>
    `,
    styleUrls: ['./inline-edit.component.scss'],
    host: {
      '[class.theme-dark]': 'theme === "dark"',
      '[class.app-inline-edit]': 'true',
      '(keyup.esc)': 'readMode = true',
      '(keyup.enter)': 'confirmEdit()'
    },
    providers: [
      {
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => InlineEditComponent),
        multi: true
      }
    ]
    })
    export class InlineEditComponent implements ControlValueAccessor {
    disabled = false;
    readMode = true;
    tempValue: string | undefined;
    faIcons = FaIcons;

    @Output() valueChange: EventEmitter<any> = new EventEmitter<any>();

    _onTouched = () => {};
    _onChange = (_: any) => {};

    @ViewChild('inlineInput') inlineInput: ElementRef | undefined = undefined;
    @ViewChild('inlineTextarea') inlineTextarea: ElementRef | undefined = undefined;

    @Input() type: 'textarea' | 'input' = 'input';
    @Input() font: 'default' | 'code' = 'default';
    @Input() label = '';
    @Input() copy = true;
    @Input() theme: string | null = null;
    @Input() monospace = false;
    @Input() placeholder: string = "";

    @Input()
    private _value: string | undefined = undefined;
    get value(): string | undefined {
      return this._value;
    }
    set value( value: any ) {
      this._value = value;
      this._onChange(value);
    }

    constructor(private toastr: ToastrService){};

    enterEditMode(type: any) {
      this.tempValue = this.value;
      this.readMode = false;
      setTimeout(() => {
        if (type === 'textarea') {
          this.inlineTextarea?.nativeElement.focus()
        } else if (type === 'input') {
          this.inlineInput?.nativeElement.focus();
        }
      });
    }

    confirmEdit() {
      if (this.value !== this.tempValue) {
        this.value = this.tempValue;
        this.valueChange.emit(this.value);
      }
      this.readMode = true;
    }

    writeValue(value: any): void {
      if (value !== this.value) {
        this.value = value;
      }
    }
    registerOnChange(fn: any): void {
      this._onChange = fn;
    }

    registerOnTouched(fn: any): void {
      this._onTouched = fn;
    }

    setDisabledState?(isDisabled: boolean): void {
      this.disabled = isDisabled;
    }
    
    onClipboardCopy(callback: any) {
      // console.log("CLIP: ", callback.content)
      this.toastr.success(callback.content, 'Copied to clipboard');
    }
}
  