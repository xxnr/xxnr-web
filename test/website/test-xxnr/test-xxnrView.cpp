// test-xxnrView.cpp : implementation of the CtestxxnrView class
//

#include "stdafx.h"
#include "test-xxnr.h"

#include "test-xxnrDoc.h"
#include "test-xxnrView.h"

#include "sitecontrolsite.h"

#ifdef _DEBUG
#define new DEBUG_NEW
#endif


// CtestxxnrView

IMPLEMENT_DYNCREATE(CtestxxnrView, CHtmlView)

BEGIN_MESSAGE_MAP(CtestxxnrView, CHtmlView)
	// Standard printing commands
	ON_COMMAND(ID_FILE_PRINT, &CHtmlView::OnFilePrint)
END_MESSAGE_MAP()

// CtestxxnrView construction/destruction

CtestxxnrView::CtestxxnrView()
{
	// TODO: add construction code here

}

CtestxxnrView::~CtestxxnrView()
{
}

BOOL CtestxxnrView::PreCreateWindow(CREATESTRUCT& cs)
{
	// TODO: Modify the Window class or styles here by modifying
	//  the CREATESTRUCT cs

	return CHtmlView::PreCreateWindow(cs);
}
	
extern "C" void RunTestCases();

void CtestxxnrView::OnInitialUpdate()
{
	CHtmlView::OnInitialUpdate();
	RunTestCases();
}


// CtestxxnrView printing



// CtestxxnrView diagnostics

#ifdef _DEBUG
void CtestxxnrView::AssertValid() const
{
	CHtmlView::AssertValid();
}

void CtestxxnrView::Dump(CDumpContext& dc) const
{
	CHtmlView::Dump(dc);
}

CtestxxnrDoc* CtestxxnrView::GetDocument() const // non-debug version is inline
{
	ASSERT(m_pDocument->IsKindOf(RUNTIME_CLASS(CtestxxnrDoc)));
	return (CtestxxnrDoc*)m_pDocument;
}
#endif //_DEBUG


// CtestxxnrView message handlers

void CtestxxnrView::OnNavigateComplete2(LPCTSTR strURL)
{
	// TODO: Add your specialized code here and/or call the base class
 CComPtr<IDispatch>   spDisp   =   GetHtmlDocument(); 
 
        if(spDisp   !=   NULL) 
 
        { 

              CComPtr<IHTMLDocument2> doc;

              spDisp->QueryInterface(IID_IHTMLDocument2, reinterpret_cast<void**>(&doc));

              if(doc != NULL)

              {   

                     IHTMLWindow2 * pIhtmlwindow2 = NULL;

                     doc->get_parentWindow(&pIhtmlwindow2);

                     if(pIhtmlwindow2 != NULL)

                     {
                            //屏蔽javascript脚本错误的javascript脚本

                            CString strJavaScriptCode = _T("function fnOnError(msg,url,lineno){/*alert('script error:\\n\\nURL:'+url+'\\n\\nMSG:'+msg +'\\n\\nLine:'+lineno);*/return true;}window.onerror=fnOnError;");
                            CString strLanguage("JavaScript");


                            //把window.onerror函数插入入当前页面中去
							CComVariant vRet;

                            pIhtmlwindow2->execScript(CComBSTR(strJavaScriptCode), CComBSTR(strLanguage), &vRet);

                           
                            pIhtmlwindow2->Release();

                     }

              }

       }

	CHtmlView::OnNavigateComplete2(strURL);
}

    BOOL CtestxxnrView::CreateControlSite(COleControlContainer* pContainer,   
       COleControlSite** ppSite, UINT /* nID */, REFCLSID /* clsid */)  
    {  
        ASSERT(ppSite != NULL);  
        *ppSite = new CSiteControlSite(pContainer);  
        return TRUE;  
    }  


	void CtestxxnrView::LoadUrlTimeout(LPCTSTR lpcstrUrl, long double fTimeout){
		this->Navigate2(lpcstrUrl);
	}