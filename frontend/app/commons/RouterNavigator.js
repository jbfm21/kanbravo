'use strict';

import {browserHistory} from 'react-router';

export default class RouterContainer
{
  static goToLogin() {browserHistory.push('/login');}
  static goToHome() {browserHistory.push('/');}
  static goToErrorPage() {browserHistory.push('/error');}
  static goToListBoard() {browserHistory.push('/boards');}
  static goToBoardSetting(board) {browserHistory.push(`/boards/${board._id}/settings`);}
  static goToBoardReport(board) {browserHistory.push(`/boards/${board._id}/reports`);}
  static goToBoardShow(board) {browserHistory.push(`/boards/${board._id}`);}
  static goToAddNewBoard() {browserHistory.push('/boards/add');}
  static navigateTo(path) {browserHistory.push(path);}
}
