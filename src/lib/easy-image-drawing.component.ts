import {
  Component,
  ViewChild,
  ElementRef,
  AfterViewInit,
  Input,
  Output,
  EventEmitter,
  OnDestroy,
  OnChanges,
} from "@angular/core";

@Component({
  selector: "easy-image-drawing",
  standalone: true,
  imports: [],
  templateUrl: "./easy-image-drawing.component.html",
  styleUrls: ["./easy-image-drawing.component.scss"],
})
export class EasyImageDrawing implements OnChanges, AfterViewInit, OnDestroy {
  @Input() width: number = 500;
  @Input() height: number = 500;
  @Input() lineWidth = 7;
  @Input() lineColor = "#000000";
  @Input() src = "";
  @Input() saveButtonColor = "#4caf50";
  @Input() undoButtonColor = "#f44336";
  @Output() savedImage = new EventEmitter<File>();

  // its important myCanvas matches the variable name in the template
  @ViewChild("drawingCanvas") canvas!: ElementRef<HTMLCanvasElement>;

  context!: CanvasRenderingContext2D;
  private previousPosition: { x: number; y: number } = { x: 0, y: 0 };
  private activePath = false;

  private _mousedown: any = null;
  private _mousemove: any = null;
  private _mouseup: any = null;

  private _touchstart: any = null;
  private _touchmove: any = null;
  private _touchend: any = null;

  ngOnChanges(): void {
    this._setCanvas();
  }

  ngAfterViewInit(): void {
    this._setCanvas();
    this._setMouseEvents();
    this._setMouseEventsMobile();
  }

  public save(): void {
    const dataUrl = this.canvas.nativeElement.toDataURL("image/png");
    const blob = this._dataURItoBlob(dataUrl);
    this.savedImage.next(new File([blob], "image.png"));
  }

  public clear(): void {
    this.context.clearRect(0, 0, this.width, this.height);
    const image = new Image();
    image.src = this.src;
    image.onload = () => {
      this.context.drawImage(image, 0, 0, this.width, this.height);
    };
  }

  private _dataURItoBlob(dataUrl: string) {
    const byteString = atob(dataUrl.split(",")[1]);
    const mimeString = dataUrl.split(",")[0].split(":")[1].split(";")[0];
    const ab = new ArrayBuffer(byteString.length);
    const dw = new DataView(ab);
    for (let i = 0; i < byteString.length; i++) {
      dw.setUint8(i, byteString.charCodeAt(i));
    }
    return new Blob([ab], { type: mimeString });
  }

  private _drawLine(event: any): void {
    const currentPosition = this.getPosition(event.clientX, event.clientY);
    this.context.moveTo(this.previousPosition.x, this.previousPosition.y);
    this.context.lineTo(currentPosition.x, currentPosition.y);
    this.previousPosition = currentPosition;
    this.context.stroke();
  }

  private getPosition(
    clientX: number,
    clientY: number
  ): { x: number; y: number } {
    const rect = this.canvas.nativeElement.getBoundingClientRect();
    const scaleX = this.canvas.nativeElement.width / rect.width;
    const scaleY = this.canvas.nativeElement.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }

  private _setCanvas(): void {
    if (!this.canvas) return;

    this.canvas.nativeElement.width = this.width;
    this.canvas.nativeElement.height = this.height;

    this.context = this.canvas.nativeElement.getContext("2d")!;
    this.context.lineWidth = this.lineWidth;
    this.context.strokeStyle = this.lineColor;
    this.context.lineCap = "round";

    // set src to image
    const image = new Image();
    image.src = this.src;
    image.onload = () => {
      this.context.drawImage(image, 0, 0, this.width, this.height);
    };
  }

  private _setMouseEvents(): void {
    this._mousedown = window.addEventListener(
      "mousedown",
      (event: MouseEvent) => {
        this.activePath = true;
        this.context.beginPath();
        this.previousPosition = this.getPosition(event.clientX, event.clientY);
      }
    );

    this._mousemove = window.addEventListener("mousemove", (event) => {
      if (this.activePath) {
        this._drawLine(event);
      }
    });

    this._mouseup = window.addEventListener("mouseup", () => {
      if (this.activePath) {
        this.context.closePath();
        this.activePath = false;
      }
    });
  }

  private _setMouseEventsMobile(): void {
    this._touchstart = window.addEventListener(
      "touchstart",
      (event: TouchEvent) => {
        this.activePath = true;
        this.context.beginPath();
        this.previousPosition = this.getPosition(
          event.touches[0].clientX,
          event.touches[0].clientY
        );
      }
    );

    this._touchmove = window.addEventListener("touchmove", (event) => {
      if (this.activePath) {
        this._drawLine(event.touches[0]);
      }
    });

    this._touchend = window.addEventListener("touchend", () => {
      if (this.activePath) {
        this.context.closePath();
        this.activePath = false;
      }
    });
  }

  private _removeEventListeners(): void {
    window.removeEventListener("mousedown", this._mousedown);
    window.removeEventListener("mousemove", this._mousemove);
    window.removeEventListener("mouseup", this._mouseup);
    window.removeEventListener("touchstart", this._touchstart);
    window.removeEventListener("touchmove", this._touchmove);
    window.removeEventListener("touchend", this._touchend);
  }

  ngOnDestroy(): void {
    this._removeEventListeners();
  }
}
