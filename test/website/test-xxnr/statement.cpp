#include "stdafx.h"
#include "statement.h"
#include "test-xxnrView.h"
#include "MainFrm.h"

namespace{
	CtestxxnrView * GetView(){
		if(CMainFrame *pMainFrame = ((CMainFrame*)AfxGetMainWnd())){
			return (CtestxxnrView*)pMainFrame->GetActiveView();
		}
		else{
			return NULL;
		}
	}
}

void LoadUrlTimeout(LPCSTR lpcstrUrl, long double fTimeout){
	if(CtestxxnrView *pView = GetView()){
		pView->LoadUrlTimeout(CA2CT(lpcstrUrl), fTimeout);
	}
}