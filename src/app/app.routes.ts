import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { What } from './pages/what/what';
import { Privacy } from './pages/privacy/privacy';

export const routes: Routes = [
    { path: '', component: Home },
    { path: 'what', component: What },
    { path: 'privacy', component: Privacy },
];
