import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { Topbar } from "./components/topbar/topbar";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, Topbar],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('bridge-x-website');
}
