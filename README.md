## ngx-easy-image-drawing

![Example Image](https://github.com/PsySanchez/ngx-easy-image-drawing/blob/master/chess.png)

Angular library for easy image drawing on a canvas

This library provides a simple and efficient way to allow users to draw on images within your Angular applications.

## Installation

```bash
npm install ngx-easy-image-drawing
```

## Usage

1. Import

```typescript
import { EasyImageDrawing } from "ngx-easy-image-drawing";

@NgModule({
  imports: [EasyImageDrawing],
})
export class AppModule {}
```

2. Use it in your template

```html
<easy-image-drawing
  [height]="canvasHeight"
  [width]="canvasWidth"
  [src]="uploadImageFilePreview"
  forceSizeExport="true" outputMimeType="uploadImageFile.type" outputQuality="1" (savedImage)="handleSavedImage($event)">
</easy-image-drawing>
```

## Options

```markdown
| Option           | Type                 | Description                                                                                       |
| ---------------- | -------------------- | ------------------------------------------------------------------------------------------------- |
| height           | number               | The height of the canvas in pixels.                                                               |
| width            | number               | The width of the canvas in pixels.                                                                |
| src              | string               | The image source URL.                                                                             |
| saveButtonColor  | string               | The backbackground color for save button (optional parameter).                                    |
| undoButtonColor  | string               | The backbackground color for save button (optional parameter).                                    |
| forceSizeExport  | boolean              | Whether to force the exported image size to match the canvas size (in the pipeline).              |
| outputMimeType   | string               | The MIME type of the exported image (e.g., 'image/jpeg', 'image/png') (in the pipeline).          |
| outputQuality    | number               | The quality of the exported image (0-1) (in the pipeline).                                        |
| savedImage       | EventEmitter<string> | An event emitted when the image is saved. The event payload is a data URL representing the image. |
```

## Example

app.component.ts
```typescript
import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { EasyImageDrawing } from "ngx-easy-image-drawing";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [RouterOutlet, EasyImageDrawing],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.css",
})
export class AppComponent {
  title = "my-project";

  canvasHeight = 600;
  canvasWidth = 600;
  uploadImageFilePreview: any = null;
  savedImage: any = null;

  onFileChange(event: any) {
    const file = event.target.files[0];
    const reader = new FileReader();
    // readAsDataURL reads the uploaded file content and returns a string representing the image data encoded as a DataURL.
    reader.readAsDataURL(file);
    // The DataURL typically starts with a prefix like data:image/jpeg;base64,. This prefix specifies the image format (image/jpeg) and encoding (base64).
    reader.onload = (e: any) => {
      // By assigning the complete DataURL string to uploadImageFilePreview, you provide the necessary information to the easy-image-drawing component to display the uploaded image.
      this.uploadImageFilePreview = e.target.result;
    };
  }

  handleSavedImage(event: any) {
    this.savedImage = event;
    // reset the image preview
    this.uploadImageFilePreview = null;
  }
}
```
app.component.html
```html
<!-- input image -->
<input type="file" (change)="onFileChange($event)" />

<!-- image preview -->
<!-- use ngIf to show the image drawing component only when the image is uploaded -->
@if(uploadImageFilePreview) {
<easy-image-drawing
  [height]="canvasHeight"
  [width]="canvasWidth"
  [src]="uploadImageFilePreview"
  saveButtonColor="#4caf50"
  undoButtonColor="#f44336"
  forceSizeExport="true"
  outputMimeType="uploadImageFile.type"
  outputQuality="1"
  (savedImage)="handleSavedImage($event)"
>
</easy-image-drawing>
}
```
