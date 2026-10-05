import { Directive, ElementRef, Input, OnChanges, OnDestroy, OnInit, inject } from "@angular/core";

const reducedMotion = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Adds the `in` class once the element scrolls into view. */
@Directive({ selector: "[appReveal]", standalone: true })
export class RevealDirective implements OnInit, OnDestroy {
  @Input() revealDelay = 0;
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private observer?: IntersectionObserver;

  ngOnInit(): void {
    const node = this.el.nativeElement;
    node.classList.add("reveal");
    if (this.revealDelay) node.style.transitionDelay = `${this.revealDelay}ms`;
    if (typeof IntersectionObserver === "undefined" || reducedMotion()) {
      node.classList.add("in");
      return;
    }
    this.observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      node.classList.add("in");
      this.observer?.disconnect();
      // Drop the stagger delay once revealed so hover effects respond instantly.
      if (this.revealDelay) setTimeout(() => (node.style.transitionDelay = ""), this.revealDelay + 900);
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
    this.observer.observe(node);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}

/** Counts a number up from zero when it becomes visible. */
@Directive({ selector: "[appCountUp]", standalone: true })
export class CountUpDirective implements OnInit, OnChanges, OnDestroy {
  @Input({ required: true }) appCountUp = 0;
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private observer?: IntersectionObserver;
  private visible = false;
  private frame = 0;

  ngOnInit(): void {
    this.el.nativeElement.textContent = "0";
    if (typeof IntersectionObserver === "undefined") {
      this.visible = true;
      this.animate();
      return;
    }
    this.observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      this.visible = true;
      this.animate();
      this.observer?.disconnect();
    }, { threshold: 0.4 });
    this.observer.observe(this.el.nativeElement);
  }

  ngOnChanges(): void {
    if (this.visible) this.animate();
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    cancelAnimationFrame(this.frame);
  }

  private animate(): void {
    const target = this.appCountUp;
    const node = this.el.nativeElement;
    cancelAnimationFrame(this.frame);
    if (reducedMotion()) {
      node.textContent = target.toLocaleString();
      return;
    }
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / 1600, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      node.textContent = Math.round(target * eased).toLocaleString();
      if (progress < 1) this.frame = requestAnimationFrame(tick);
    };
    this.frame = requestAnimationFrame(tick);
  }
}
