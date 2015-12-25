
%{


#include <atlstr.h>

int yyerror(char *msg);
extern int yylex (void);
#include "statement.h"
   

 %}

  %union {
  char * text;
  long double value;
  void setText(char *text);
}

// %token <value>	NUMBER
// %type <value>	expression

        %token    CALL Script VERIFY  LOAD URL TIMEOUT CLICK ID STRING NUMBER BOOLEAN_TRUE BOOLEAN_FALSE

        %%
        test_cases : test_cases test_case
        |  
        ;

        test_case : statements;

		statements : statement | statements "=>" statement;

		statement : CALL Script | VERIFY Expression | LOAD URL Timeout { LoadUrlTimeout($<text>2, $<value>3); } | CLICK ID; 
		Timeout : TIMEOUT '=' NUMBER { $<value>$ = $<value>3; } | {$<value>$ = 12; };
		Expression : BOOLEAN_TRUE | BOOLEAN_FALSE;

        %%
        int main()
        {
        yyparse();
        return 0;
        }
        int yyerror(char *msg)
        {
        printf("Error        encountered: %s \n", msg);
		return 0;
        } 

		extern FILE * yyin;

		#ifdef __cplusplus
		extern "C"
		#endif
		void RunTestCases(){
		if(yyin = fopen("test-cases.txt", "r")){
			main();
			fclose(yyin);
		}
		}

		void YYSTYPE::setText(char *text){
			this->text = strdup(text);
		}