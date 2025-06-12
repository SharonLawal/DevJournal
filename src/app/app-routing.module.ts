import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

import { DashboardComponent } from './dashboard/dashboard.component';
import { JournalComponent } from './journal/journal.component';
import { ChatComponent } from './chat/chat.component';
import { SettingsComponent } from './settings/settings.component';
import { AddJournalComponent } from './journal/add-journal/add-journal.component';
import { ViewJournalComponent } from './journal/view-journal/view-journal.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'journal', component: JournalComponent, canActivate: [AuthGuard] },
  { path: 'add-journal', component: AddJournalComponent, canActivate: [AuthGuard] },
  { path: 'view-journal/:id', component: ViewJournalComponent, canActivate: [AuthGuard] },
  { path: 'edit-journal/:id', component: AddJournalComponent, canActivate: [AuthGuard] },
  { path: 'chat', component: ChatComponent, canActivate: [AuthGuard] },
  { path: 'settings', component: SettingsComponent, canActivate: [AuthGuard] },

  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
