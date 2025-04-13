import butterup from 'butteruptoasts';
import '../ui/theme.css';
import 'butteruptoasts/src/butterup.css';

export function displayInfoMessage(content) {
  butterup.toast({
    message: content,
    location: 'bottom-center',
    dismissable: true,
    type: 'info',
    icon: true,
    customIcon: `
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
    `
  });
}

export function displayWarnMessage(content) {
  butterup.toast({
    message: content,
    location: 'bottom-center',
    dismissable: true,
    type: 'warn',
    icon: true,
    customIcon: `
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
    `
  });
}


