import {
  Component,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  OnChanges,
  Renderer2,
  SimpleChanges,
  output,
  input,
} from "@angular/core";
import { MatSliderModule } from "@angular/material/slider";

@Component({
  selector: "easy-image-drawing",
  standalone: true,
  imports: [MatSliderModule],
  templateUrl: "./easy-image-drawing.component.html",
  styleUrls: ["./easy-image-drawing.component.scss"],
})
export class EasyImageDrawing implements OnChanges, AfterViewInit, OnDestroy {
  width = input<number>(500);
  height = input<number>(500);
  src = input<string>("");
  saveButtonColor = input<string>("#4caf50");
  undoButtonColor = input<string>("#f44336");
  showColorPicker = input<boolean>(true);
  showlineWidthPicker = input<boolean>(true);
  savedImage = output<File>();

  // its important myCanvas matches the variable name in the template
  @ViewChild("drawingCanvas") canvas!: ElementRef<HTMLCanvasElement>;

  context!: CanvasRenderingContext2D;

  private lineWidth = 5;
  private lineColor = "black";
  private previousPosition: { x: number; y: number } = { x: 0, y: 0 };
  private activePath = false;
  private eventListeners: (() => void)[] = [];

  constructor(private renderer: Renderer2) {}

  ngAfterViewInit(): void {
    this._setCanvas();
    this._setMouseEvents();
    this._setMouseEventsMobile();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["src"] && !changes["src"].firstChange) {
      this.clear();
    }
  }
  public save(): void {
    const dataUrl = this.canvas.nativeElement.toDataURL("image/png");
    const blob = this._dataURItoBlob(dataUrl);
    this.savedImage.emit(new File([blob], "image.png"));
  }

  public clear(): void {
    this.context.clearRect(0, 0, this.width(), this.height());
    const image = new Image();
    image.src = this.src();
    image.onload = () => {
      this.context.drawImage(image, 0, 0, this.width(), this.height());
    };
  }

  public onColorSelected(color: string): void {
    this.context.strokeStyle = color;
  }

  public onLineWidthChanged(event: any): void {
    if (event?.target?.value) {
      this.context.lineWidth = event.target.value;
    }
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

  private _drawLine(event: MouseEvent | Touch): void {
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

    this.canvas.nativeElement.width = this.width();
    this.canvas.nativeElement.height = this.height();

    const context = this.canvas.nativeElement.getContext("2d");
    if (!context) {
      console.error("Failed to get 2D context");
      return;
    }
    this.context = context;
    this.context.lineWidth = this.lineWidth;
    this.context.strokeStyle = this.lineColor;
    this.context.lineCap = "round";

    // set src to image
    const image = new Image();
    image.src = this.src();
    image.onload = () => {
      this.context.drawImage(image, 0, 0, this.width(), this.height());
    };
  }

  private _setMouseEvents(): void {
    this.eventListeners.push(
      this.renderer.listen("window", "mousedown", this._onMouseDown.bind(this)),
      this.renderer.listen("window", "mousemove", this._onMouseMove.bind(this)),
      this.renderer.listen("window", "mouseup", this._onMouseUp.bind(this))
    );
  }

  private _onMouseDown(event: MouseEvent): void {
    this.activePath = true;
    this.context.beginPath();
    this.previousPosition = this.getPosition(event.clientX, event.clientY);
  }

  private _onMouseMove(event: MouseEvent): void {
    if (this.activePath) {
      this._drawLine(event);
    }
  }

  private _onMouseUp(): void {
    if (this.activePath) {
      this.context.closePath();
      this.activePath = false;
    }
  }

  private _setMouseEventsMobile(): void {
    this.eventListeners.push(
      this.renderer.listen(
        "window",
        "touchstart",
        this._onTouchStart.bind(this)
      ),
      this.renderer.listen("window", "touchmove", this._onTouchMove.bind(this)),
      this.renderer.listen("window", "touchend", this._onTouchEnd.bind(this))
    );
  }

  private _onTouchStart(event: TouchEvent): void {
    this.activePath = true;
    this.context.beginPath();
    this.previousPosition = this.getPosition(
      event.touches[0].clientX,
      event.touches[0].clientY
    );
  }

  private _onTouchMove(event: TouchEvent): void {
    if (this.activePath) {
      this._drawLine(event.touches[0]);
    }
  }

  private _onTouchEnd(): void {
    if (this.activePath) {
      this.context.closePath();
      this.activePath = false;
    }
  }

  ngOnDestroy(): void {
    this.eventListeners.forEach((unlisten) => unlisten());
  }
}
