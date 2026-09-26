import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { What } from './pages/what/what';

export const routes: Routes = [
    { path: '', component: Home },
    { path: 'what', component: What },
];
