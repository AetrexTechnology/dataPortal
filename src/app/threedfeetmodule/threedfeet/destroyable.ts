import { Component, Directive, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
@Component({
  template: ''
})
/**
 * Allows to subscribe to 'destroyed' event.
 *
 * If your class needs to extend another class, use `Destroyable` instead.
 */
// tslint:disable-next-line:directive-class-suffix
export class DestroyableBase implements OnDestroy {
  /** Triggers when component is being destroyed. */
  public destroy$ = new Subject();

  /** @inheritdoc */
  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

export type Constructor<T> = new (...args: any[]) => T | ((...args: any[]) => T);

/**
 * Allows to subscribe to 'destroyed' event.
 *
 * If your class does not extend any other class, use `DestroyableBase` instead.
 *
 * @howToUse
 * @example
 * class MyComponent extends Destroyable(ParentComponent) { }
 */
// tslint:disable-next-line: typedef
export function Destroyable<T extends Constructor<any>>(Base: T) {
  return class extends Base implements OnDestroy {
    constructor(...args: any[]) {
      super(...args);
    }

    /** Triggers when component is being destroyed. */
    public destroy$ = new Subject();

    /** @inheritdoc */
    public ngOnDestroy(): void {
      this.destroy$.next();
      this.destroy$.complete();
    }
  };
}
